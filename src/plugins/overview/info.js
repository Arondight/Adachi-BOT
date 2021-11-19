/* global alias, command */
/* eslint no-undef: "error" */

import { render } from "../../utils/render.js";
import { getInfo } from "../../utils/api.js";
import { filterWordsByRegex, guessPossibleNames } from "../../utils/tools.js";

function getNotFoundText(text) {
  const guess = guessPossibleNames(text, alias.allNames);
  const notFoundText = `查询失败，未知的名称${text}。${guess ? "\n您要查询的是不是：\n" + guess : ""}`;

  return notFoundText;
}

async function doInfo(msg) {
  let text = filterWordsByRegex(msg.text, ...command.functions.entrance.info);
  let data;

  if (!text) {
    msg.bot.say(msg.sid, "请输入名称。", msg.type, msg.uid, true);
    return;
  }

  text = "string" === typeof text ? text.toLowerCase() : "";

  try {
    data = await getInfo(alias.all[text] || text);
  } catch (e) {
    msg.bot.say(msg.sid, getNotFoundText(text), msg.type, msg.uid, true);
    return;
  }

  render(msg, data, "genshin-overview");
}

export { doInfo };
