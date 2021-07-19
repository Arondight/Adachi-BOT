const helpMessage =
`命令列表：

🔘 带话权限     <QQ> <on|off>
🔘 十连权限     <QQ> <on|off>
🔘 圣遗物权限   <QQ> <on|off>
🔘 UID权限      <QQ> <on|off>
🔘 角色权限     <QQ> <on|off>
🔘 刷新卡池`;

module.exports = async ( id, type ) => {
    await bot.sendMessage(id, helpMessage, type);
}
