import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { feedback } from "./feedback.js";
import { menu } from "./menu.js";
import { prophecy } from "./prophecy.js";
import { quote } from "./quote.js";
import { roll } from "./roll.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "tools", "menu"):
      if (false !== checkAuth(msg, "menu")) {
        menu(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "prophecy"):
      if (false !== checkAuth(msg, "prophecy")) {
        prophecy(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "roll"):
      if (false !== checkAuth(msg, "roll")) {
        roll(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "quote"):
      if (false !== checkAuth(msg, "quote")) {
        quote(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "feedback"):
      if (false !== checkAuth(msg, "feedback")) {
        feedback(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "help"):
      msg.bot.say(msg.sid, global.command.usage, msg.type, msg.uid, true, "\n");
      break;
    case hasEntrance(msg.text, "tools", "master"):
      msg.bot.say(msg.sid, global.master.usage, msg.type, msg.uid, true, "\n");
      break;
  }
}

export { Plugin as run };
