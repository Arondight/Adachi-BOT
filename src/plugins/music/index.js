const { get } = require('../../utils/database');
const { errMsg, musicID, musicSrc } = require('./music');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let ret, data, src;

    switch (true) {
        case msg.includes('点歌'):
            data = await get('music', 'source', { ID:sendID });
            src = data ? data['Source'] : '163';
            ret = await musicID(msg, src);

            if (ret in errMsg) {
                return await bot.sendMessage(sendID, errMsg[ret], type);
            }

            await bot.sendMessage(sendID, ret, type);
            break;
        case msg.includes('音乐源'):
            ret = await musicSrc(msg, sendID);
            return await bot.sendMessage(sendID, ret ? `音乐源已切换为${ret}。`
                                                     : '音乐源切换失败。', type);
            break;
    }
}

