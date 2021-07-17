const { basePromise } = require('../../utils/detail');
const { get, isInside, getID } = require('../../utils/database');
const { hasAuth, sendPrompt } = require('../../utils/auth');
const render = require('../../utils/render');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let dbInfo  = await getID(msg, userID);
    let [character] = msg.split(/(?<=^\S+)\s/).slice(1);
    let uid, data;

    if (!(await hasAuth(userID, 'query'))) {
        await sendPrompt(sendID, name, '查询游戏内信息', type);
        return;
    }

    if (typeof dbInfo === 'string') {
        await bot.sendMessage(sendID, dbInfo.toString(), type);
        return;
    }

    if (!character) {
        await bot.sendMessage(sendID, "请正确输入角色名称", type);
        return;
    }

    try {
        const baseInfo = await basePromise(dbInfo, userID);
        uid = baseInfo[0];
        const { avatars } = await get('info', 'user', { uid });
        data = avatars.find(el => el.name === character);

        if (!data) {
            await bot.sendMessage(sendID, "查询失败，请检查角色名称是否正确或您是否拥有该角色", type);
            return;
        }
    } catch (errInfo) {
        if (errInfo !== '') {
            await bot.sendMessage(sendID, errInfo, type);
            return;
        }
    }

    await render({ uid, data }, 'genshin-character', sendID, type);
}
