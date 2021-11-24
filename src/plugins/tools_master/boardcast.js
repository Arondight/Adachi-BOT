import { hasEntrance } from "../../utils/config.js";
import { filterWordsByRegex } from "../../utils/tools.js";

function boardcast(msg) {
  const text = filterWordsByRegex(
    msg.text,
    ...[...global.master.functions.entrance.group_boardcast, ...global.master.functions.entrance.private_boardcast]
  );
  let report = "";

  for (const t of [
    ["group", "group_boardcast"],
    ["private", "private_boardcast"],
  ]) {
    const [type, entrance] = t;
    const isGroup = "group" === type;
    const typestr = isGroup ? "群" : "好友";
    const list = isGroup ? msg.bot.gl : msg.bot.fl;

    if (hasEntrance(msg.text, "tools_master", entrance)) {
      list.forEach((item) => {
        // 广播无法 @
        msg.bot.say(isGroup ? item.group_id : item.user_id, `主人发送了一条${typestr}广播：\n${text}`, type);
        report += `${isGroup ? item.group_name : item.nickname}（${isGroup ? item.group_id : item.user_id}）\n`;
      });
      report += report ? `以上${typestr}已发送广播。` : `没有发现任何${typestr}。`;
      msg.bot.say(msg.sid, report, msg.type, msg.uid, true, "\n");
    }
  }
}

export { boardcast };
