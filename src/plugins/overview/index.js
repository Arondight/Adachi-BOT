/* global alias */
/* eslint no-undef: "error" */

import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { getInfo } from "../../utils/api.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const [text] = msg.split(/(?<=^\S+)\s/).slice(1);
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

  try {
    data = await getInfo(
      alias["string" === typeof text ? text.toLowerCase() : text] || text
    );
  } catch (e) {
    await bot.sendMessage(
      sendID,
      "查询失败，请检查名称是否正确。",
      type,
      userID
    );
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
