import { getRandomInt } from "#utils/tools";

async function fortune(msg) {
    const luck = global.fortune.luck[getRandomInt(global.fortune.luck.length)];
    const thing=global.fortune.things[getRandomInt(global.fortune.things.length)];
    const pre="今天的幸运物是："+`${thing.item}`
    const message = `${luck.summary}\n${luck.lucky}\n${luck.text[getRandomInt(luck.text.length)]}
                    \n${pre}\n${thing.description}\n`;
    msg.bot.say(msg.sid, message, msg.type, msg.uid, true, "\n");
}

export { fortune };
