import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { getInfo } from "../../utils/api.js";

async function Plugin(Message, bot) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let [text] = msg.split(/(?<=^\S+)\s/).slice(1);
  let data;

  if (
    !(await hasAuth(userID, "overview")) ||
    !(await hasAuth(sendID, "overview"))
  ) {
    await sendPrompt(sendID, userID, name, "查询游戏数据", type);
    return;
  }

  if (!text) {
    await bot.sendMessage(sendID, "请输入名称。", type, userID);
    return;
  }

  try {
    data = await getInfo(alias[text] ? alias[text] : text);
  } catch (errInfo) {
    await bot.sendMessage(
      sendID,
      "查询失败，请检查名称是否正确。",
      type,
      userID
    );
    return;
  }

  await render(data, "genshin-overview", sendID, type, userID, bot);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
