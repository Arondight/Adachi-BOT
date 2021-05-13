module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let character = msg.split(/(?<=^\S+)\s/).slice(1)
    let request = require('request').defaults({ encoding: null });
    let weapon_url = 'https://upload-bbs.mihoyo.com/upload/2021/04/28/75276545/553459116f6aa3e12e4323393ee24b6d_5571196186126561969.png';
    let talent_url = 'https://upload-bbs.mihoyo.com/upload/2021/04/28/75276545/d0a500156192bc55b14e623806615f93_6219160940681956086.png';
    let weekly_url = 'https://upload-bbs.mihoyo.com/upload/2021/04/28/75276545/acc156e0bbc8dbdcbc4a5c96f429c625_6103003511668528645.png';
    let this_url;

    switch (true) {
        case msg.includes('武器'):
            this_url = weapon_url;
            break;
        case msg.includes('天赋'):
            this_url = talent_url;
            break;
        case msg.includes('周本'):
            this_url = weekly_url;
            break;
    }

    request.get(this_url, async function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data = Buffer.from(body).toString('base64');
            await bot.sendMessage(sendID, "[CQ:image,file=base64://" + data + "]", type);
        }
    });
}
