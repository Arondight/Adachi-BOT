import { isMaster } from "../../utils/auth.js";

async function count(id, msg, type, user) {
  let [text] = msg.split(/(?<=^\S+)\s/).slice(1);
  let report = "";
  let num = 0;

  if (!isMaster(user)) {
    await bot.sendMessage(id, `[CQ:at,qq=${user}] 不能使用管理命令。`, type);
    return;
  }

  if (msg.startsWith("统计列表")) {
    report += `好友个数：${bot.fl.size - 1}`; // 排除好友列表中的自己
    report += `\n群组个数：${bot.gl.size}`;
    bot.gl.forEach((item) => {
      if (item) {
        num += item.member_count;
        num--; // 排除群友列表中的自己
      }
    });
    report += `\n群友个数：${num}`;
    await bot.sendMessage(id, report, type);
    return;
  }
}

export { count };
