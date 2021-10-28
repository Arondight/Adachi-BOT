/* global alias, all */
/* eslint no-undef: "error" */

import lodash from "lodash";
import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
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

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const sendID = "group" === type ? groupID : userID;
  const name = Message.sender.nickname;
  let [cmd] = msg.split(/(?<=^\S+)\s/).slice(1);

  await userInitialize(userID);

  if (!(await hasAuth(userID, "gacha")) || !(await hasAuth(sendID, "gacha"))) {
    await sendPrompt(sendID, userID, name, "祈愿十连", type, bot);
    return;
  }

  if (hasEntrance(msg, "gacha", "pool")) {
    let choice = 301;

    switch (cmd) {
      case all.functions.options.pool[200]:
        choice = 200;
        break;
      case all.functions.options.pool[301]:
        choice = 301;
        break;
      case all.functions.options.pool[302]:
        choice = 302;
        break;
      case all.functions.options.pool[999]:
        choice = 999;
        break;
    }

    await db.update("gacha", "user", { userID }, { choice });
    await bot.sendMessage(
      sendID,
      `您的卡池已切换至：${all.functions.options.pool[choice]}。`,
      type,
      userID
    );
  } else if (hasEntrance(msg, "gacha", "gacha")) {
    const data = await getGachaResult(userID, name);
    await render(data, "genshin-gacha", sendID, type, userID, bot);
  } else if (hasEntrance(msg, "gacha", "select-what")) {
    const { choice } = await db.get("gacha", "user", { userID });

    if (choice !== 302) {
      await bot.sendMessage(
        sendID,
        "当前非武器卡池无法查看定轨。",
        type,
        userID
      );
      return;
    }

    const table = await db.get("gacha", "data", { gacha_type: 302 });
    const { path } = await db.get("gacha", "user", { userID });

    if (null === path.course)
      await bot.sendMessage(sendID, "当前未指定定轨武器。", type, userID);
    else
      await bot.sendMessage(
        sendID,
        `当前定轨${table.upFiveStar[path.course].item_name}，命定值为 ${
          path.fate
        } 。`,
        type,
        userID
      );
  } else if (hasEntrance(msg, "gacha", "select-nothing")) {
    const path = { course: null, fate: 0 };
    await db.update("gacha", "user", { userID }, { path });
    await bot.sendMessage(sendID, "已取消定轨。", type, userID);
    return;
  } else if (hasEntrance(msg, "gacha", "select")) {
    const { choice } = await db.get("gacha", "user", { userID });

    if (choice !== 302) {
      await bot.sendMessage(
        sendID,
        "当前非武器卡池无法进行定轨。",
        type,
        userID
      );
      return;
    }

    const table = await db.get("gacha", "data", { gacha_type: 302 });
    cmd =
      alias.weapon["string" === typeof cmd ? cmd.toLowerCase() : cmd] || cmd;

    if (cmd && lodash.find(table.upFiveStar, { item_name: cmd })) {
      await bot.sendMessage(
        sendID,
        `定轨${cmd}成功，命定值已清零。`,
        type,
        userID
      );
      const path = {
        course: lodash.findIndex(table.upFiveStar, { item_name: cmd }),
        fate: 0,
      };
      await db.update("gacha", "user", { userID }, { path });
    } else {
      await bot.sendMessage(
        sendID,
        `请从当前 UP 武器${lodash
          .map(table.upFiveStar, "item_name")
          .join("、")}中选择一个进行定轨。`,
        type,
        userID
      );
      return;
    }
  }
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
