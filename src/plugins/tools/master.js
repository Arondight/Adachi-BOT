const helpMessage = `🔘 带话权限 <QQ号|群号> <on|off> 👉 【带个话】
🔘 点歌权限 <QQ号|群号> <on|off> 👉 【点歌】
🔘 十连权限 <QQ号|群号> <on|off> 👉 【十连】
🔘 圣遗物权限 <QQ号|群号> <on|off> 👉 【圣遗物】【强化】
🔘 游戏数据权限 <QQ号|群号> <on|off> 👉 【深渊】【上期深渊】【米游社】【UID】
🔘 官方数据权限 <QQ号|群号> <on|off> 👉 【角色】【武器】
🔘 歇逼 <群号> <on|off> 👉 开启后在此群内歇逼
🔘 刷新卡池
-------------------
📎 <> 表示必填，[] 表示可选，前面需加空格
📎 可选项不填通常约定自己、上一个或随机
📎 手指（👉）后面是说明`;

module.exports = async (id, type) => {
  await bot.sendMessage(id, helpMessage, type);
};
