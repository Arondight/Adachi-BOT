import { getRandomInt } from "#utils/tools";

function roll(msg) {
  let cmd = msg.text.match(/[+-]?[0-9]+/g);

  if (null === cmd) {
    cmd = ["100"];
  }

  if (1 === cmd.length) {
    const max = parseInt(cmd[0]);
    const res = max < 1 || max > 100 ? "骰子面数应为不超过 100 的正整数。" : `骰子的结果为: ${getRandomInt(max)}。`;
    msg.bot.say(msg.sid, res, msg.type, msg.uid, true);
  }
}

export { roll };
