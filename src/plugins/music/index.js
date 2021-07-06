var querystring = require('querystring');
var request = require('request');

module.exports = async Message => {
    let msg     = Message.raw_message;
    let userID  = Message.user_id;
    let groupID = Message.group_id;
    let type    = Message.type;
    let name    = Message.sender.nickname;
    let sendID  = type === 'group' ? groupID : userID;
    let keyword = msg.split(/(?<=^\S+)\s/).slice(1);
    let api163 = 'http://music.163.com/api/search/get/';
    let data163 = {
        's':      keyword,
        'type':   1,  // 1:单曲, 10:专辑, 100:歌手, 1000:歌单, 1002:用户, 1004:MV, 1006:歌词, 1009:电台, 1014:视频
        'limit':  1,
        'offset': 0
    }
    let form163 = querystring.stringify(data163);
    let length163 = form163.length;
    let hasKey = (obj, level,  ...rest) => {
        if (obj === undefined) {
            return false
        }
        if (rest.length == 0 && obj.hasOwnProperty(level)) {
            return true
        }

        return hasKey(obj[level], ...rest)
    }

    await request({
        url: api163,
        method: "POST",
        headers: {
            'Content-Length': length163,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'http://music.163.com',
            'Cookie':  'appver=2.0.2'
        },
        body: form163
    },
    async (error, response, body) => {
        if (!error && response.statusCode == 200) {
            jbody = JSON.parse(body);

            if (hasKey(jbody, 'result', 'songs', 0, 'id')) {
                jmusic = [
                {
                    'type': 'music',
                    'data': {
                        'type': 163,
                        'id': jbody['result']['songs'][0]['id']
                    }
                }]
                await bot.sendMessage(sendID, jmusic, type);
            } else {
                await bot.sendMessage(sendID, '没有查询到对应歌曲', type);
            }
        } else {
            await bot.sendMessage(sendID, '歌曲查询出错', type);
        }
    })
}

