const imageCache = require('image-cache');
const path = require('path');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let cacheDir  = path.join(path.resolve(__dirname, '..', '..', '..', 'data', 'image', 'material'), '/');
    let weaponURL = 'https://upload-bbs.mihoyo.com/upload/2021/07/22/75833613/c09ceb516fe4ec34b124ddd77de659db_819114535348518207.png';
    let talentURL = 'https://upload-bbs.mihoyo.com/upload/2021/07/22/75833613/0dd284b10c7541e960fe4f8fdabef14a_7320203396734694053.png';
    let weeklyURL = 'https://upload-bbs.mihoyo.com/upload/2021/07/22/75833613/e447aac7cd51c5d034f6b278da5b6d94_6414867999308885693.png';
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
