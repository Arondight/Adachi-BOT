const { isMaster } = require("../../utils/auth");

module.exports = async (id, msg, type, user) => {
  let [text] = msg.split(/(?<=^\S+)\s/).slice(1);
  let listAll = new Map([...bot.fl].concat([...bot.gl]));
  let report = "";

  if (!isMaster(user)) {
    await bot.sendMessage(id, `[CQ:at,qq=${user}] 不能使用管理命令。`, type);
    return;
  }

  if (msg.startsWith("群列表")) {
    bot.gl.forEach((item) => {
      report += `${item.group_name}（${item.group_id}）\n`;
    });

    await bot.sendMessage(id, report, type);
    return;
  }

  if (msg.startsWith("好友列表")) {
    bot.fl.forEach((item) => {
      report += `${item.nickname}（${item.user_id}）\n`;
    });

    await bot.sendMessage(id, report, type);
    return;
  }

  if (msg.startsWith("查找列表")) {
    listAll.forEach(async (item) => {
      let isGroup = item.hasOwnProperty("group_name") ? true : false;
      let itemName = isGroup ? item.group_name : item.nickname;
      let itemID = isGroup ? item.group_id : item.user_id;
      let typeStr = isGroup ? "群组" : "好友";

      if (itemName.includes(text) || itemID.toString().includes(text)) {
        report += `${typeStr}：${itemName}（${itemID}）\n`;
      }
    });

    await bot.sendMessage(id, report, type);
    return;
  }
};
