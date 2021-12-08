import { hasEntrance } from "../../utils/config.js";
import { filterWordsByRegex } from "../../utils/tools.js";

function boardcast(msg) {
  const text = filterWordsByRegex(
    msg.text,
    ...[...global.master.functions.entrance.group_boardcast, ...global.master.functions.entrance.private_boardcast]
  );

  for (const t of [
    ["group", "group_boardcast"],
    ["private", "private_boardcast"],
  ]) {
    const [type, entrance] = t;
    const isGroup = "group" === type;
    const typestr = isGroup ? "群" : "好友";
    const list = isGroup ? msg.bot.gl : msg.bot.fl;

    if (hasEntrance(msg.text, "tools_master", entrance)) {
      const delay = 50;
      let report = "";

      list.forEach(
        (c) => (report += `${isGroup ? c.group_name : c.nickname}（${isGroup ? c.group_id : c.user_id}）\n`)
      );

      if ("" === report) {
        msg.bot.say(msg.sid, `没有发现任何${typestr}。`, msg.type, msg.uid, true, "\n");
        return;
      }

      report += `以上${typestr}正在发送广播，速度为 ${1000 / delay} 个${typestr}每秒。`;
      msg.bot.say(msg.sid, report, msg.type, msg.uid, true, "\n");

      let count = 0;

      list.forEach((c) =>
        // 广播无法 @
        setTimeout(
          () => msg.bot.say(isGroup ? c.group_id : c.user_id, `主人发送了一条${typestr}广播：\n${text}`, type),
          delay * count++
        )
      );
    }
  }
}

export { boardcast };
