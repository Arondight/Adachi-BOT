const { getCharacterOverview } = require('../../utils/api');
const { hasAuth, sendPrompt } = require('../../utils/auth');
const render = require('../../utils/render');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let [character] = msg.split(/(?<=^\S+)\s/).slice(1);
    let data;

    if (!(await hasAuth(userID, 'overview'))) {
        await sendPrompt(sendID, name, '查询角色信息', type);
        return;
    }

    if (!character) {
        await bot.sendMessage(sendID, "请正确输入角色名称", type);
        return;
    }

    try {
        data = await getCharacterOverview(character);
    } catch (errInfo) {
        await bot.sendMessage(sendID, "查询失败，请检查角色名称是否正确", type);
        return;
    }

    await render(data, 'genshin-overview', sendID, type);
}
