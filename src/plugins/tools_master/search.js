import { hasEntrance } from "../../utils/config.js";

async function search(id, text, type, user, bot) {
  const [str] = text.split(/(?<=^\S+)\s/).slice(1);
  const listAll = new Map([...bot.fl, ...bot.gl]);
  let report = "";

  if (hasEntrance(text, "tools_master", "group_search")) {
    bot.gl.forEach((item) => {
      report += `${item.group_name}（${item.group_id}）\n`;
    });
    report += report ? "" : "没有加入任何群。";

    await bot.say(id, report, type, user);
    return;
  }

  if (hasEntrance(text, "tools_master", "private_search")) {
    bot.fl.forEach((item) => {
      report += `${item.nickname}（${item.user_id}）\n`;
    });
    report += report ? "" : "没有添加任何好友。";

    await bot.say(id, report, type, user);
    return;
  }

  if (hasEntrance(text, "tools_master", "search")) {
    listAll.forEach(async (item) => {
      const isGroup = item.group_name ? true : false;
      const itemName = isGroup ? item.group_name : item.nickname;
      const itemID = isGroup ? item.group_id : item.user_id;
      const typeStr = isGroup ? "群组" : "好友";

      if (itemName.includes(str) || itemID.toString().includes(str)) {
        report += `${typeStr}：${itemName}（${itemID}）\n`;
      }
    });
    report += report ? "" : `没有找到昵称或者 QQ 号中包含 ${str} 的群或好友。`;

    await bot.say(id, report, type, user, "\n");
    return;
  }
}

export { search };
