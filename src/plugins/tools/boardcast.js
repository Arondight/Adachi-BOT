const { isMaster } = require("../../utils/auth");

module.exports = async (id, msg, type) => {
  let text = msg.split(/(?<=\d+\S+)\s/).slice(1);
  let report;

  if (!isMaster(id)) {
    await bot.sendMessage(id, `[CQ:at,qq=${id}] 不能使用管理命令。`, type);
    return;
  }

  if (msg.includes("群广播")) {
    bot.gl.forEach(async (item) => {
      await bot.sendMessage(item.group_id, "主人发送了一条群广播：\n" + text, "group");
      report += `${item.group_name}（${item.group_id}）\n`;
    });

    report += "以上群已发送广播。"
    await bot.sendMessage(id, list, type);
    return;
  }

  if (msg.includes("好友广播")) {
    bot.gl.forEach(async (item) => {
      await bot.sendMessage(item.user_id, "主人发送了一条好友广播：\n" + text, type);
      report += `${item.nickname}（${item.user_id}）\n`;
    });

    report += "以上好友已发送广播。"
    await bot.sendMessage(id, list, type);
    return;
  }
};
