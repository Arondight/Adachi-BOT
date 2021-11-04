import { hasEntrance } from "../../utils/config.js";

async function boardcast(id, text, type, user, bot) {
  const [msg] = text.split(/(?<=^\S+)\s/).slice(1);
  let report = "";

  if (hasEntrance(text, "tools_master", "group_boardcast")) {
    bot.gl.forEach((item) => {
      // 广播无法 @
      bot.say(item.group_id, `主人发送了一条群广播：\n${msg}`, "group");
      report += `${item.group_name}（${item.group_id}）\n`;
    });
    report += report ? "以上群已发送广播。" : "没有加入任何群。";
    await bot.say(id, report, type, user, "\n");
    return;
  }

  if (hasEntrance(text, "tools_master", "private_boardcast")) {
    bot.fl.forEach((item) => {
      // 广播无法 @
      bot.say(item.user_id, `主人发送了一条好友广播：\n${msg}`, "private");
      report += `${item.nickname}（${item.user_id}）\n`;
    });
    report += report ? "以上好友已发送广播。" : "没有添加任何好友。";
    await bot.say(id, report, type, user, "\n");
    return;
  }
}

export { boardcast };
