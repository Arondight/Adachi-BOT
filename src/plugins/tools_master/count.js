function count(msg) {
  let report = "";
  let num = 0;

  report += `好友个数：${msg.bot.fl.size - 1}`; // 排除好友列表中的自己
  report += `\n群组个数：${msg.bot.gl.size}`;

  msg.bot.gl.forEach((item) => {
    if (item) {
      num += item.member_count;
      num--; // 排除群友列表中的自己
    }
  });

  report += `\n群友个数：${num}`;

  msg.bot.say(msg.sid, report, msg.type, msg.uid, false, "\n");
  return;
}

export { count };
