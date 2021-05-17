const imageCache = require('image-cache');
const path = require('path');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let character = msg.split(/(?<=^\S+)\s/).slice(1);
    let cacheDir  = path.join(path.resolve(__dirname, '..', '..', '..', 'data', 'image', 'material'), '/');
    let weaponURL = 'https://upload-bbs.mihoyo.com/upload/2021/04/28/75276545/553459116f6aa3e12e4323393ee24b6d_5571196186126561969.png';
    let talentURL = 'https://upload-bbs.mihoyo.com/upload/2021/04/28/75276545/d0a500156192bc55b14e623806615f93_6219160940681956086.png';
    let weeklyURL = 'https://upload-bbs.mihoyo.com/upload/2021/04/28/75276545/acc156e0bbc8dbdcbc4a5c96f429c625_6103003511668528645.png';
    let thisURL   = weeklyURL;

    imageCache.setOptions({
       dir:         cacheDir,
       compressed:  false,
       googleCache: false
    });

    switch (true) {
        case msg.includes('武器'):
            thisURL = weaponURL;
            break;
        case msg.includes('天赋'):
            thisURL = talentURL;
            break;
        case msg.includes('周本'):
            thisURL = weeklyURL;
            break;
    }

    imageCache.fetchImages(thisURL).then(async (image) => {
        data = image.data.substr(image.data.indexOf(',') + 1);
        await bot.sendMessage(sendID, "[CQ:image,file=base64://" + data + "]", type);
    });
}
