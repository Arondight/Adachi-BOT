const { getInfo } = require('../../utils/api');
const render = require('../../utils/render');


module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let dbInfo  = await getID(msg, userID), uid;



    try {
        const data = await getInfo(msg);
        await render(data, 'genshin-overview', id, type);
    } catch (errInfo) {
        if (errInfo !== '') {
            await bot.sendMessage(sendID, errInfo, type);
            return;
        }
    }


}
