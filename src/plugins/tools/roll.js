const getRandomInt = require('../../utils/rand.js');

module.exports = async ( id, msg, type ) => {
    let cmd = msg.match(/[+-]?[0-9]+/g);

    if (cmd == null) {
        cmd = [ "100" ];
    }

    if (cmd.length === 1) {
        let max = parseInt(cmd[0]);
        let res = (max < 1) || (max > 100) ? '骰子面数应为不超过 100 的正整数'
                                               : '骰子的结果为: ' + getRandomInt(max);
        await bot.sendMessage(id, res, type);
    }
}
