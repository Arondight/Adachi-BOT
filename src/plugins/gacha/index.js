import lodash from "lodash";
import db from "../../utils/database.js";
import { alias } from "../../utils/alias.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { getGachaResult } from "./gacha.js";

async function userInitialize(userID) {
  if (!(await db.includes("gacha", "user", "userID", userID))) {
    await db.push("gacha", "user", {
      userID,
      choice: 301,
      indefinite: { five: 1, four: 1, isUp: undefined },
      character: { five: 1, four: 1, isUp: 0 },
      weapon: { five: 1, four: 1, isUp: null },
      path: { course: null, fate: 0 },
    });
  }
}

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = "group" === type ? groupID : userID;
  let name = Message.sender.nickname;
  let [cmd] = msg.split(/(?<=^\S+)\s/).slice(1);

  await userInitialize(userID);

  if (!(await hasAuth(userID, "gacha")) || !(await hasAuth(sendID, "gacha"))) {
    await sendPrompt(sendID, userID, name, "祈愿十连", type);
    return;
  }

  if (msg.startsWith("卡池")) {
    let choice = 301;

    switch (cmd) {
      case "常驻":
        choice = 200;
        break;
      case "角色":
        choice = 301;
        break;
      case "武器":
        choice = 302;
        break;
    }

    await db.update("gacha", "user", { userID }, { choice });
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 您的卡池已切换至：${cmd}。`,
      type
    );
  } else if (msg.startsWith("十连")) {
    let data = await getGachaResult(userID, name);
    await render(data, "genshin-gacha", sendID, type);
  } else if (msg.startsWith("查看定轨")) {
    const { choice } = await db.get("gacha", "user", { userID });

    if (choice !== 302) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 当前卡池非武器池，无法查看定轨。。`,
        type
      );
      return;
    }

    const table = await db.get("gacha", "data", { gacha_type: 302 });
    const { path } = await db.get("gacha", "user", { userID });

    if (null === path["course"])
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 当前未指定定轨武器。`,
        type
      );
    else
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 当前定轨${
          table["upFiveStar"][path["course"]]["item_name"]
        }，命定值为 ${path["fate"]} 。`,
        type
      );
  } else if (msg.startsWith("取消定轨")) {
    let path = { course: null, fate: 0 };
    await db.update("gacha", "user", { userID }, { path });
    await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] 已取消定轨。`, type);
    return;
  } else if (msg.startsWith("定轨")) {
    const { choice } = await db.get("gacha", "user", { userID });

    if (choice !== 302) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 当前卡池非武器池，无法进行定轨。`,
        type
      );
      return;
    }

    const table = await db.get("gacha", "data", { gacha_type: 302 });
    cmd = alias(cmd);

    if (cmd && lodash.find(table["upFiveStar"], { item_name: cmd })) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 定轨${cmd}成功，命定值已清零。`,
        type
      );
      let path = {
        course: lodash.findIndex(table["upFiveStar"], { item_name: cmd }),
        fate: 0,
      };
      await db.update("gacha", "user", { userID }, { path });
    } else {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 请从当前 UP 武器${lodash
          .map(table["upFiveStar"], "item_name")
          .join("、")}中选择一个进行定轨。`,
        type
      );
      return;
    }
  }
}

export { Plugin as run };
