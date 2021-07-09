export default async Message => {
    let msg = Message.raw_message;
    let userID = Message.user_id;
    let groupID = Message.group_id;
    let type = Message.type;
    let name = Message.sender.nickname;
    let sendID = type === 'group' ? groupID : userID;
    let keyword = msg.split(/(?<=^\S+)\s/).slice(1);

    try {
        let music_id = await qmusic(keyword)

        jmusic = [
            {
                'type': 'music',
                'data': {
                    'type': "qq",
                    'id': music_id
                }
            }];

        await bot.sendMessage(sendID, jmusic, type);

    }
    catch (error) {
        await bot.sendMessage(sendID, error.message, type);
    }

}

async function qmusic(word) {
    let qmusicapi = 'https://api.qq.jsososo.com/search/quick?key=' //第三方qq音乐api
    // let musicuri = 'https://i.y.qq.com/v8/playsong.html?songid='
    let query = qmusicapi + word

    try {
        let resp = await (await fetch(query, {
            "credentials": "omit",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
                "Upgrade-Insecure-Requests": "1",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            },
            "method": "GET",
            "mode": "cors"
        })).json()

        console.log(resp)
        if (resp.result == 100) {
            if (resp.data.song.count != 0) {
                return resp.data.song.itemlist[0].id
            } else {
                throw Error('搜不到歌曲')
            }
        } else {
            throw Error('查询api出错：' + resp.result)
        }
    } catch (error) {
        throw error
    }
}