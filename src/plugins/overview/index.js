/* global alias */
/* eslint no-undef: "error" */

import lodash from "lodash";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { getInfo } from "../../utils/api.js";
import { guessPossibleNames } from "../../utils/tools.js";

function getNotFoundText(text) {
  const guess = guessPossibleNames(text, alias.allNames);
  const notFoundText = `查询失败，未知的名称${text}。${
    guess ? "\n您要查询的是不是：\n" + guess : ""
  }`;

  return notFoundText;
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  let [text] = msg.split(/(?<=^\S+)\s/).slice(1);
  let data;

  if (
    !(await hasAuth(userID, "overview")) ||
    !(await hasAuth(sendID, "overview"))
  ) {
    await sendPrompt(sendID, userID, name, "查询游戏数据", type, bot);
    return;
  }

  if (!text) {
    await bot.sendMessage(sendID, "请输入名称。", type, userID);
    return;
  }

  text = "string" === typeof text ? text.toLowerCase() : "";

  try {
    data = await getInfo(alias.all[text] || text);
  } catch (e) {
    await bot.sendMessage(sendID, getNotFoundText(text), type, userID);
    return;
  }

  await render(data, "genshin-overview", sendID, type, userID, bot, 2);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
