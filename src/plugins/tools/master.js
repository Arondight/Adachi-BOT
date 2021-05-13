const helpMessage =
`命令列表：

1. 反馈权限     <QQ> <on|off>
2. 十连权限     <QQ> <on|off>
3. 圣遗物权限   <QQ> <on|off>
4. UID权限      <QQ> <on|off>
5. 角色信息权限 <QQ> <on|off>
6. 刷新卡池`;

module.exports = async ( id, type ) => {
    await bot.sendMessage(id, helpMessage, type);
}
