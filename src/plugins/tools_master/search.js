import { hasEntrance } from "../../utils/config.js";

async function search(id, msg, type, user, bot) {
  let [text] = msg.split(/(?<=^\S+)\s/).slice(1);
  let listAll = new Map([...bot.fl, ...bot.gl]);
  let report = "";

  if (hasEntrance(msg, "tools_master", "group_search")) {
    bot.gl.forEach((item) => {
      report += `${item.group_name}（${item.group_id}）\n`;
    });
    report += report ? "" : "没有加入任何群。";

    await bot.sendMessage(id, report, type, user);
    return;
  }

  if (hasEntrance(msg, "tools_master", "private_search")) {
    bot.fl.forEach((item) => {
      report += `${item.nickname}（${item.user_id}）\n`;
    });
    report += report ? "" : "没有添加任何好友。";

    await bot.sendMessage(id, report, type, user);
    return;
  }

  if (hasEntrance(msg, "tools_master", "search")) {
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

    await bot.sendMessage(id, report, type, user, "\n");
    return;
  }
}

export { search };
