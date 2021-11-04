/* global command, master */
/* eslint no-undef: "error" */

import { hasEntrance } from "../../utils/config.js";
import { feedback } from "./feedback.js";
import { menu } from "./menu.js";
import { prophecy } from "./prophecy.js";
import { quote } from "./quote.js";
import { roll } from "./roll.js";

async function Plugin(msg, bot) {
  const groupName = "group" === msg.type ? msg.group_name : undefined;

  switch (true) {
    case hasEntrance(msg.text, "tools", "menu"):
      menu(msg.sid, msg.text, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools", "prophecy"):
      prophecy(msg.sid, msg.text, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools", "roll"):
      roll(msg.sid, msg.text, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools", "quote"):
      quote(msg.sid, msg.text, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools", "feedback"):
      feedback(msg.sid, msg.name, msg.text, msg.type, msg.uid, groupName, bot);
      break;
    case hasEntrance(msg.text, "tools", "help"):
      await bot.say(msg.sid, command.usage, msg.type, msg.uid, "\n");
      break;
    case hasEntrance(msg.text, "tools", "master"):
      await bot.say(msg.sid, master.usage, msg.type, msg.uid, "\n");
      break;
  }
}

export { Plugin as run };
