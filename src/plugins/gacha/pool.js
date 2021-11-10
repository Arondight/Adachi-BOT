/* global all */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { init } from "./init.js";

function doPool(msg) {
  const [cmd] = msg.text.split(/(?<=^\S+)\s/).slice(1);
  let choice = 301;

  switch (cmd) {
    case all.functions.options.pool[200]:
      choice = 200;
      break;
    case all.functions.options.pool[301]:
      choice = 301;
      break;
    case all.functions.options.pool[302]:
      choice = 302;
      break;
    case all.functions.options.pool[999]:
      choice = 999;
      break;
  }

  init(msg.uid);
  db.merge("gacha", "user", { userID: msg.uid }, { choice });
  msg.bot.say(msg.sid, `您的卡池已切换至：${all.functions.options.pool[choice]}。`, msg.type, msg.uid);
}

export { doPool };
