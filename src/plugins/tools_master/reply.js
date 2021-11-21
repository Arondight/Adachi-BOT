/* global master */
/* eslint no-undef: "error" */

import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";

function reply(msg) {
  const [target, text] = getWordByRegex(filterWordsByRegex(msg.text, ...master.functions.entrance.reply), /\d+/);
  const list = new Map([...msg.bot.fl, ...msg.bot.gl]);

  list.forEach((item) => {
    const curType = item.group_id ? "group" : "private";
    const itemID = "group" === curType ? item.group_id : item.user_id;

    if (itemID == target) {
      // 送话无法 @
      msg.bot.say(itemID, `主人让我送个话：\n${text}`, curType);
      // 私聊无法 @
      msg.bot.say(msg.sid, `我已经给${itemID}送话了。`, "private");
    }
  });
}

export { reply };
