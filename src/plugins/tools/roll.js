import { getRandomInt } from "../../utils/tools.js";

async function roll(id, name, msg, type, user, bot) {
  let cmd = msg.match(/[+-]?[0-9]+/g);

  if (null === cmd) {
    cmd = ["100"];
  }

  if (1 === cmd.length) {
    let max = parseInt(cmd[0]);
    let res =
      max < 1 || max > 100
        ? "骰子面数应为不超过 100 的正整数。"
        : `骰子的结果为: ${getRandomInt(max)}。`;
    await bot.sendMessage(id, res, type, user);
  }
}

export { roll };
