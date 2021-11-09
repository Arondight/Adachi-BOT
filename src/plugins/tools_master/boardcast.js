import { hasEntrance } from "../../utils/config.js";

function boardcast(msg) {
  const [text] = msg.text.split(/(?<=^\S+)\s/).slice(1);
  let report = "";

  if (hasEntrance(msg.text, "tools_master", "group_boardcast")) {
    msg.bot.gl.forEach((item) => {
      // 广播无法 @
      msg.bot.say(item.group_id, `主人发送了一条群广播：\n${text}`, "group");
      report += `${item.group_name}（${item.group_id}）\n`;
    });
    report += report ? "以上群已发送广播。" : "没有加入任何群。";
    msg.bot.say(msg.sid, report, msg.type, msg.uid, "\n");
    return;
  }

  if (hasEntrance(msg.text, "tools_master", "private_boardcast")) {
    msg.bot.fl.forEach((item) => {
      // 广播无法 @
      msg.bot.say(item.user_id, `主人发送了一条好友广播：\n${text}`, "private");
      report += `${item.nickname}（${item.user_id}）\n`;
    });
    report += report ? "以上好友已发送广播。" : "没有添加任何好友。";
    msg.bot.say(msg.sid, report, msg.type, msg.uid, "\n");
    return;
  }
}

export { boardcast };
