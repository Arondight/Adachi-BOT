const { isMaster } = require("../../utils/auth");

const boardcast = async (id, msg, type, user) => {
  let [text] = msg.split(/(?<=^\S+)\s/).slice(1);
  let report = "";

  if (!isMaster(user)) {
    await bot.sendMessage(id, `[CQ:at,qq=${user}] 不能使用管理命令。`, type);
    return;
  }

  if (msg.includes("群广播")) {
    bot.gl.forEach((item) => {
      bot.sendMessage(
        item.group_id,
        "主人发送了一条群广播：\n" + text,
        "group"
      );
      report += `${item.group_name}（${item.group_id}）\n`;
    });

    report += report ? "以上群已发送广播。" : "没有加入任何群。";
    await bot.sendMessage(id, report, type);
    return;
  }

  if (msg.includes("好友广播")) {
    bot.fl.forEach((item) => {
      bot.sendMessage(item.user_id, "主人发送了一条好友广播：\n" + text, type);
      report += `${item.nickname}（${item.user_id}）\n`;
    });

    report += report ? "以上好友已发送广播。" : "没有添加任何好友。";
    await bot.sendMessage(id, report, type);
    return;
  }
};

module.exports = {
  boardcast,
};
