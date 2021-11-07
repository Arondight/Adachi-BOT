/* global alias */
/* eslint no-undef: "error" */

import lodash from "lodash";
import db from "../../utils/database.js";
import { init } from "./init.js";

async function doSelect(msg) {
  await init(msg.uid);

  let [cmd] = msg.text.split(/(?<=^\S+)\s/).slice(1);
  const { choice } = await db.get("gacha", "user", { userID: msg.uid });

  if (choice !== 302) {
    await msg.bot.say(msg.sid, "当前非武器卡池无法进行定轨。", msg.type, msg.uid);
    return;
  }

  const table = await db.get("gacha", "data", { gacha_type: 302 });
  cmd = alias.weapon["string" === typeof cmd ? cmd.toLowerCase() : cmd] || cmd;

  if (cmd && lodash.find(table.upFiveStar, { item_name: cmd })) {
    await msg.bot.say(msg.sid, `定轨${cmd}成功，命定值已清零。`, msg.type, msg.uid);
    const path = {
      course: lodash.findIndex(table.upFiveStar, { item_name: cmd }),
      fate: 0,
    };
    await db.update("gacha", "user", { userID: msg.uid }, { path });
  } else {
    const text = `请从当前 UP 武器${lodash.map(table.upFiveStar, "item_name").join("、")}中选择一个进行定轨。`;
    await msg.bot.say(msg.sid, text, msg.type, msg.uid);
  }
}

async function doSelectWhat(msg) {
  await init(msg.uid);

  const { choice } = await db.get("gacha", "user", { userID: msg.uid });

  if (choice !== 302) {
    await msg.bot.say(msg.sid, "当前非武器卡池无法查看定轨。", msg.type, msg.uid);
    return;
  }

  const table = await db.get("gacha", "data", { gacha_type: 302 });
  const { path } = await db.get("gacha", "user", { userID: msg.uid });

  if (null === path.course) {
    await msg.bot.say(msg.sid, "当前未指定定轨武器。", msg.type, msg.uid);
  } else {
    const text = `当前定轨${table.upFiveStar[path.course].item_name}，命定值为 ${path.fate} 。`;
    await msg.bot.say(msg.sid, text, msg.type, msg.uid);
  }
}

async function doSelectNothing(msg) {
  const path = { course: null, fate: 0 };

  await init(msg.uid);
  await db.update("gacha", "user", { userID: msg.uid }, { path });
  await msg.bot.say(msg.sid, "已取消定轨。", msg.type, msg.uid);
}

export { doSelect, doSelectWhat, doSelectNothing };
