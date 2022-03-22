import { getRandomInt } from "#utils/tools";

async function prophecy(msg) {
  const data = global.prophecy.data[getRandomInt(global.prophecy.data.length)];
  const message = `${data.summary}\n${data.lucky}\n${data.text[getRandomInt(data.text.length)]}`;
  msg.bot.say(msg.sid, message, msg.type, msg.uid, true, "\n");
}

export { prophecy };