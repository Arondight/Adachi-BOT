import { feedback } from "#plugins/tools/feedback";
import { menu } from "#plugins/tools/menu";
import { prophecy } from "#plugins/tools/prophecy";
import { roll } from "#plugins/tools/roll";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

("use strict");

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "tools", "menu"):
      if (checkAuth(msg, "menu")) {
        menu(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "prophecy"):
      if (checkAuth(msg, "prophecy")) {
        prophecy(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "roll"):
      if (checkAuth(msg, "roll")) {
        roll(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "feedback"):
      if (checkAuth(msg, "feedback")) {
        feedback(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "help"):
      msg.bot.say(msg.sid, global.command.usage, msg.type, msg.uid, false, "\n");
      break;
    case hasEntrance(msg.text, "tools", "master"):
      msg.bot.say(msg.sid, global.master.usage, msg.type, msg.uid, false, "\n");
      break;
  }
}

export { Plugin as run };
