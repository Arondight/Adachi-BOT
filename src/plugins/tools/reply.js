const { hasAuth, sendPrompt } = require("../../utils/auth");

module.exports = async (id, msg, type) => {
  let id = parseInt(msg.match(/[0-9]+/g)[0]);
  let text = msg.split(/(?<=^\d+\S+)\s/)[0]

  if (!isMaster(userID)) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 不能使用管理命令。`,
      type
    );
    return;
  }

  if ((id in bot.fl) || (id in bot.gl)) {
    await bot.sendMessage(id, "主人让我送个话：\n" + text, type);
  }
};
