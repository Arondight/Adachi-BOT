/* global alias, command */
/* eslint no-undef: "error" */

import { render } from "../../utils/render.js";
import { getInfo } from "../../utils/api.js";
import { filterWordsByRegex, guessPossibleNames } from "../../utils/tools.js";

function getNotFoundText(text) {
  const guess = guessPossibleNames(text, Object.keys(alias.allNames));
  const notFoundText = `查询失败，未知的名称${text}。${
    guess.length > 0 ? "\n您要查询的是不是：\n" + guess.join("、") : ""
  }`;

  return notFoundText;
}

async function doInfo(msg, name = undefined) {
  let text = name || filterWordsByRegex(msg.text, ...command.functions.entrance.info);
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
