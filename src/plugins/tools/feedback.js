const { hasAuth, sendPrompt } = require('../../utils/auth');

module.exports = async ( id, name, msg, type, user ) => {
    let info = msg.slice(4);

    if (!(await hasAuth(user, 'feedback'))) {
        await sendPrompt(id, name, '反馈', type);
    } else {
        await bot.sendMaster(id, `${name}(${user})托我给您带个话：\n ${info}`, type);
        await bot.sendMessage(id, '我这就去给主人带个话！', type);
    }
}
