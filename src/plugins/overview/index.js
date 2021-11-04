/* global alias */
/* eslint no-undef: "error" */

import { render } from "../../utils/render.js";
import { hasAuth, sayAuth } from "../../utils/auth.js";
import { getInfo } from "../../utils/api.js";
import { guessPossibleNames } from "../../utils/tools.js";

function getNotFoundText(text) {
  const guess = guessPossibleNames(text, alias.allNames);
  const notFoundText = `查询失败，未知的名称${text}。${guess ? "\n您要查询的是不是：\n" + guess : ""}`;

  return notFoundText;
}

async function Plugin(msg, bot) {
  let [text] = msg.text.split(/(?<=^\S+)\s/).slice(1);
  let data;

  if (!(await hasAuth(msg.uid, "overview")) || !(await hasAuth(msg.sid, "overview"))) {
    await sayAuth(msg.sid, msg.uid, name, "查询游戏数据", msg.type, bot);
    return;
  }

  if (!text) {
    await bot.say(msg.sid, "请输入名称。", msg.type, msg.uid);
    return;
  }

  text = "string" === typeof text ? text.toLowerCase() : "";

  try {
    data = await getInfo(alias.all[text] || text);
  } catch (e) {
    await bot.say(msg.sid, getNotFoundText(text), msg.type, msg.uid);
    return;
  }

  await render(data, "genshin-overview", msg.sid, msg.type, msg.uid, bot, 2);
}

export { Plugin as run };
