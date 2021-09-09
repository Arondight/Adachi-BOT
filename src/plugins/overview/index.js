const { getInfo } = require("../../utils/api");
const { hasAuth, sendPrompt } = require("../../utils/auth");
const { render } = require("../../utils/render");
const { alias } = require("../../utils/alias");

module.exports = async (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
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
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 请正确输入名称。`,
      type
    );
    return;
  }

  try {
    data = await getInfo(alias(text));
  } catch (errInfo) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 查询失败，请检查名称是否正确。`,
      type
    );
    return;
  }

  await render(data, "genshin-overview", sendID, type);
};
