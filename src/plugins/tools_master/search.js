import { hasEntrance } from "../../utils/config.js";
import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";

function search(msg) {
  const [text] = getWordByRegex(filterWordsByRegex(msg.text, ...global.master.functions.entrance.search), /\S+/);
  const listAll = new Map([...msg.bot.fl, ...msg.bot.gl]);
  let report = "";

  for (const [type, entrance] of [
    ["group", "group_search"],
    ["private", "private_search"],
  ]) {
    const isGroup = "group" === type;
    const typestr = isGroup ? "群" : "好友";
    const list = isGroup ? msg.bot.gl : msg.bot.fl;

    if (hasEntrance(msg.text, "tools_master", entrance)) {
      list.forEach(
        (item) =>
          (report += `${isGroup ? item.group_name : item.nickname}（${isGroup ? item.group_id : item.user_id}）\n`)
      );
      report += report ? "" : `没有发现任何${typestr}。`;
      msg.bot.say(msg.sid, report, msg.type, msg.uid, false);
      return;
    }
  }

  if (hasEntrance(msg.text, "tools_master", "search")) {
    listAll.forEach((item) => {
      const isGroup = item.group_name ? true : false;
      const itemName = isGroup ? item.group_name : item.nickname;
      const itemID = isGroup ? item.group_id : item.user_id;
      const typeStr = isGroup ? "群组" : "好友";

      if (itemName.includes(text) || itemID.toString().includes(text)) {
        report += `${typeStr}：${itemName}（${itemID}）\n`;
      }
    });

    report += report ? "" : `没有找到昵称或者 QQ 号中包含 ${text} 的群或好友。`;
    msg.bot.say(msg.sid, report, msg.type, msg.uid, false, "\n");
    return;
  }
}

export { search };
