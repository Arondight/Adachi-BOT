import { hasEntrance } from "../../utils/config.js";

async function boardcast(id, msg, type, user, bot) {
  let [text] = msg.split(/(?<=^\S+)\s/).slice(1);
  let report = "";

  if (hasEntrance(msg, "tools_master", "group_boardcast")) {
    bot.gl.forEach((item) => {
      // 广播无法 @
      bot.sendMessage(
        item.group_id,
        `主人发送了一条群广播：\n${text}`,
        "group"
      );
      report += `${item.group_name}（${item.group_id}）\n`;
    });
    report += report ? "以上群已发送广播。" : "没有加入任何群。";
    await bot.sendMessage(id, report, type, user, "\n");
    return;
  }

  if (hasEntrance(msg, "tools_master", "private_boardcast")) {
    bot.fl.forEach((item) => {
      // 广播无法 @
      bot.sendMessage(
        item.user_id,
        `主人发送了一条好友广播：\n${text}`,
        "private"
      );
      report += `${item.nickname}（${item.user_id}）\n`;
    });
    report += report ? "以上好友已发送广播。" : "没有添加任何好友。";
    await bot.sendMessage(id, report, type, user, "\n");
    return;
  }
}

export { boardcast };
