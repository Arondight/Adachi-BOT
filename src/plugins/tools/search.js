const { isMaster } = require("../../utils/auth");

const search = async (id, msg, type, user) => {
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

    report += report ? "" : "没有加入任何群。";
    await bot.sendMessage(id, report, type);
    return;
  }

  if (msg.startsWith("好友列表")) {
    bot.fl.forEach((item) => {
      report += `${item.nickname}（${item.user_id}）\n`;
    });

    report += report ? "" : "没有添加任何好友。";
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

    report += report ? "" : `没有找到昵称或者 QQ 号中包含 ${text} 的群或好友。`;
    await bot.sendMessage(id, report, type);
    return;
  }
};

module.exports = {
  search,
};
