const { getInfo } = require("../../utils/api");
const { hasAuth, sendPrompt } = require("../../utils/auth");
const { getID } = require("../../utils/database");
const render = require("../../utils/render");

module.exports = async (Message) => {
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let msg = /[\u4e00-\u9fa5]+$/g.exec(Message.raw_message);
  let data;

  if (
    !(await hasAuth(userID, "overview")) ||
    !(await hasAuth(sendID, "overview"))
  ) {
    await sendPrompt(sendID, name, "查询游戏数据", type);
    return;
  }

  if (!msg) {
    await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] 请正确输入名称`, type);
    return;
  }

  try {
    data = await getInfo(msg);
  } catch (errInfo) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 查询失败，请检查名称是否正确`,
      type
    );
    return;
  }

  await render(data, "genshin-overview", sendID, type);
};
