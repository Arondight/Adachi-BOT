const helpMessage = `🔘 带话权限 <QQ号|群号> <on|off> 👉 【带个话】
🔘 点歌权限 <QQ号|群号> <on|off> 👉 【点歌】
🔘 十连权限 <QQ号|群号> <on|off> 👉 【十连】
🔘 圣遗物权限 <QQ号|群号> <on|off> 👉 【圣遗物】【强化】
🔘 评分权限 <QQ号|群号> <on|off> 👉 【评分】
🔘 游戏数据权限 <QQ号|群号> <on|off> 👉 【深渊】【上期深渊】【米游社】【UID】
🔘 官方数据权限 <QQ号|群号> <on|off> 👉 【角色】【武器】
🔘 响应消息 <QQ号|群号> <on|off>
🔘 回个话 <QQ号|群号> <文本...> 👉 与指定的 QQ、群聊天
🔘 群广播 <单行图文...>
🔘 好友广播 <单行图文...>
🔘 刷新卡池
🔘 群列表
🔘 好友列表
🔘 查找列表 <关键字> 👉 查找昵称、QQ号中包含关键字的好友和群
-------------------
📎 <> 表示必填，[] 表示可选，前面需加空格
📎 可选项不填通常约定自己、上一个或随机
📎 手指（👉）后面是说明`;

async function master(id, type) {
  await bot.sendMessage(id, helpMessage, type);
}

export { master };
