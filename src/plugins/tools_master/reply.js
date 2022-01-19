import { isStranger } from "../../utils/oicq.js";
import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";

function doReply(msg, id, text, type) {
  // 送话无法 @
  msg.bot.say(id, `主人让我送个话：\n${text}`, type);
  // 私聊无法 @
  msg.bot.say(msg.sid, `我已经给${id}送话了。`, "private");
}

async function reply(msg) {
  const [target, text] = getWordByRegex(filterWordsByRegex(msg.text, ...global.master.functions.entrance.reply), /\d+/);
  const list = new Map([...msg.bot.fl, ...msg.bot.gl]);
  const tid = parseInt(target);

  for (const [, item] of list) {
    const curType = item.group_id ? "group" : "private";
    let id = "group" === curType ? item.group_id : item.user_id;

    if (id === tid || ("group" === curType && true === (await isStranger(msg.bot, id, tid)))) {
      doReply(msg, tid, text, id === tid ? curType : "private");
      return;
    }
  }
}

export { reply };
