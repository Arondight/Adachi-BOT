/* global alias */
/* eslint no-undef: "error" */

import { render } from "../../utils/render.js";
import { getInfo } from "../../utils/api.js";
import { guessPossibleNames } from "../../utils/tools.js";

function getNotFoundText(text) {
  const guess = guessPossibleNames(text, alias.allNames);
  const notFoundText = `查询失败，未知的名称${text}。${guess ? "\n您要查询的是不是：\n" + guess : ""}`;

  return notFoundText;
}

async function doInfo(msg) {
  let [text] = msg.text.split(/(?<=^\S+)\s/).slice(1);
  let data;

  if (!text) {
    await msg.bot.say(msg.sid, "请输入名称。", msg.type, msg.uid);
    return;
  }

  text = "string" === typeof text ? text.toLowerCase() : "";

  try {
    data = await getInfo(alias.all[text] || text);
  } catch (e) {
    await msg.bot.say(msg.sid, getNotFoundText(text), msg.type, msg.uid);
    return;
  }

  await render(data, "genshin-overview", msg.sid, msg.type, msg.uid, msg.bot, 2);
}

export { doInfo };
