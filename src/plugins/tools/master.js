const helpMessage = `🔘 带话权限 <QQ号|群号> <on|off>
🔘 点歌权限 <QQ号|群号> <on|off>
🔘 十连权限 <QQ号|群号> <on|off>
🔘 圣遗物权限 <QQ号|群号> <on|off>
🔘 游戏数据权限 <QQ号|群号> <on|off>
🔘 官方数据权限 <QQ号|群号> <on|off>
🔘 歇逼 <QQ号|群号> <on|off>
🔘 刷新卡池`;

module.exports = async (id, type) => {
  await bot.sendMessage(id, helpMessage, type);
};
