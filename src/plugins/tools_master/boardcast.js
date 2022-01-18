import { hasEntrance } from "../../utils/config.js";
import { filterWordsByRegex } from "../../utils/tools.js";

function boardcast(msg) {
  const text = filterWordsByRegex(
    msg.text,
    ...[...global.master.functions.entrance.group_boardcast, ...global.master.functions.entrance.private_boardcast]
  );

  for (const [type, entrance] of [
    ["group", "group_boardcast"],
    ["private", "private_boardcast"],
  ]) {
    if (hasEntrance(msg.text, "tools_master", entrance)) {
      const isGroup = "group" === type;
      const typestr = isGroup ? "群" : "好友";
      msg.bot.boardcast(`主人发送了一条${typestr}广播：\n${text}`, type);
    }
  }
}

export { boardcast };
