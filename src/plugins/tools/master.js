const helpMessage =
`🔘 带话权限 <QQ号|群号> <on|off>
🔘 十连权限 <QQ号|群号> <on|off>
🔘 圣遗物权限 <QQ号|群号> <on|off>
🔘 UID权限 <QQ号|群号> <on|off>
🔘 角色权限 <QQ号|群号> <on|off>
🔘 刷新卡池`;

module.exports = async ( id, type ) => {
    await bot.sendMessage(id, helpMessage, type);
}
