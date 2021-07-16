const imageCache = require('image-cache');
const path = require('path');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let [character] = msg.split(/(?<=^\S+)\s/).slice(1);
    let cacheDir  = path.join(path.resolve(__dirname, '..', '..', '..', 'data', 'image', 'material'), '/');
    let weaponURL = 'https://upload-bbs.mihoyo.com/upload/2021/06/29/75833613/78553111e3f705be9f430b4c0f9e3b77_4347243224656757262.png';
    let talentURL = 'https://upload-bbs.mihoyo.com/upload/2021/06/29/75276545/364f013d1b924a9e0e17bfb916d5e5cd_7559214073741712253.png';
    let weeklyURL = 'https://upload-bbs.mihoyo.com/upload/2021/06/29/75276545/e2f61dc58be38e8027644e373ab0e25b_6409837945255084893.png';
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
