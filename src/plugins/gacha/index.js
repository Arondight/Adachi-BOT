/* global alias, all */
/* eslint no-undef: "error" */

import lodash from "lodash";
import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sayAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { getGachaResult } from "./gacha.js";

async function userInitialize(uid) {
  if (!(await db.includes("gacha", "user", "uid", uid))) {
    await db.push("gacha", "user", {
      userID: uid,
      choice: 301,
      indefinite: { five: 1, four: 1, isUp: undefined },
      character: { five: 1, four: 1, isUp: 0 },
      weapon: { five: 1, four: 1, isUp: null },
      path: { course: null, fate: 0 },
    });
  }
}

async function Plugin(msg, bot) {
  let [cmd] = msg.text.split(/(?<=^\S+)\s/).slice(1);

  await userInitialize(msg.uid);

  if (!(await hasAuth(msg.uid, "gacha")) || !(await hasAuth(msg.sid, "gacha"))) {
    await sayAuth(msg.sid, msg.uid, msg.name, "祈愿十连", msg.type, bot);
    return;
  }

  if (hasEntrance(msg.text, "gacha", "pool")) {
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

    await db.update("gacha", "user", { userID: msg.uid }, { choice });
    await bot.say(msg.sid, `您的卡池已切换至：${all.functions.options.pool[choice]}。`, msg.type, msg.uid);
  } else if (hasEntrance(msg.text, "gacha", "gacha")) {
    const data = await getGachaResult(msg.uid, msg.name);
    await render(data, "genshin-gacha", msg.sid, msg.type, msg.uid, bot);
  } else if (hasEntrance(msg.text, "gacha", "select-what")) {
    const { choice } = await db.get("gacha", "user", { userID: msg.uid });

    if (choice !== 302) {
      await bot.say(msg.sid, "当前非武器卡池无法查看定轨。", msg.type, msg.uid);
      return;
    }

    const table = await db.get("gacha", "data", { gacha_type: 302 });
    const { path } = await db.get("gacha", "user", { userID: msg.uid });

    if (null === path.course) {
      await bot.say(msg.sid, "当前未指定定轨武器。", msg.type, msg.uid);
    } else {
      const text = `当前定轨${table.upFiveStar[path.course].item_name}，命定值为 ${path.fate} 。`;
      await bot.say(msg.sid, text, msg.type, msg.uid);
    }
  } else if (hasEntrance(msg.text, "gacha", "select-nothing")) {
    const path = { course: null, fate: 0 };
    await db.update("gacha", "user", { userID: msg.uid }, { path });
    await bot.say(msg.sid, "已取消定轨。", msg.type, msg.uid);
    return;
  } else if (hasEntrance(msg.text, "gacha", "select")) {
    const { choice } = await db.get("gacha", "user", { userID: msg.uid });

    if (choice !== 302) {
      await bot.say(msg.sid, "当前非武器卡池无法进行定轨。", msg.type, msg.uid);
      return;
    }

    const table = await db.get("gacha", "data", { gacha_type: 302 });
    cmd = alias.weapon["string" === typeof cmd ? cmd.toLowerCase() : cmd] || cmd;

    if (cmd && lodash.find(table.upFiveStar, { item_name: cmd })) {
      await bot.say(msg.sid, `定轨${cmd}成功，命定值已清零。`, msg.type, msg.uid);
      const path = {
        course: lodash.findIndex(table.upFiveStar, { item_name: cmd }),
        fate: 0,
      };
      await db.update("gacha", "user", { userID: msg.uid }, { path });
    } else {
      const text = `请从当前 UP 武器${lodash.map(table.upFiveStar, "item_name").join("、")}中选择一个进行定轨。`;
      await bot.say(msg.sid, text, msg.type, msg.uid);
      return;
    }
  }
}

export { Plugin as run };
