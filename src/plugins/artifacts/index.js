const { getArtifact, domainInfo } = require('./data.js');
const { get, isInside, push } = require('../../utils/database');
const { hasAuth, sendPrompt } = require('../../utils/auth');
const render = require('../../utils/render');

const userInitialize = async userID => {
    if (!(await isInside('artifact', 'user', 'userID', userID))) {
        await push('artifact', 'user', {
            userID,
            initial: {},
            fortified: {}
        });
    }
};

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let sendID  = type === 'group' ? groupID : userID;
    let name    = Message.sender.nickname;
    let cmd     = msg.split(/(?<=^\S+)\s/).slice(1)

    await userInitialize(userID);

    if (!(await hasAuth(userID, 'artifact'))) {
        await sendPrompt(sendID, name, '抽取圣遗物', type);
        return;
    }

    if (cmd === null) {
        if (msg.includes('强化')) {
            const { initial, fortified } = await get('artifact', 'user', { userID });
            if (JSON.stringify(initial) !== '{}') {
                data = fortified;
            } else {
                await bot.sendMessage(sendID, "请先使用【圣遗物】抽取一个圣遗物后再使用该命令", type);
                return;
            }
        } else if (msg.includes('圣遗物')) {
            await getArtifact(userID,-1);
            data = (await get('artifact', 'user', { userID })).initial;
        } else if (msg.includes('副本')) {
            await bot.sendMessage(sendID, domainInfo(), type);
            return;
        }
    } else if (cmd.length === 1) {
        await getArtifact(userID, parseInt(cmd[0]));
        data = (await get('artifact', 'user', { userID })).initial;
    } else {
        await bot.sendMessage(sendID, "请正确输入副本ID", type);
    }

    await render(data, 'genshin-artifact', sendID, type);
}
