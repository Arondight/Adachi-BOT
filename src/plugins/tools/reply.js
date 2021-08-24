const { isMaster } = require("../../utils/auth");

module.exports = async (id, msg, type) => {
  let target = parseInt(msg.match(/[0-9]+/g)[0]);
  let text = msg.split(/(?<=\d+\S+)\s/).slice(1);   // Array
  let list = new Map([...bot.fl].concat([...bot.gl]));

  if (!isMaster(id)) {
    await bot.sendMessage(id, `[CQ:at,qq=${id}] 不能使用管理命令。`, type);
    return;
  }

  list.forEach(async (item) => {
    let itemID = item.hasOwnProperty("group_id") ? item.group_id : item.user_id;
    let curType = item.hasOwnProperty("group_id") ? "group" : type;

    if (itemID == target) {
      await bot.sendMessage(itemID, "主人让我送个话：\n" + text, curType);
      await bot.sendMessage(id, `我已经给${itemID}送话了。`, type);
    }
  });
};
