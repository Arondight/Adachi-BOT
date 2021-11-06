/* global command, master */
/* eslint no-undef: "error" */

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
      if (false !== (await checkAuth(msg, "menu"))) {
        await menu(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "prophecy"):
      if (false !== (await checkAuth(msg, "prophecy"))) {
        await prophecy(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "roll"):
      if (false !== (await checkAuth(msg, "roll"))) {
        await roll(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "quote"):
      if (false !== (await checkAuth(msg, "quote"))) {
        await quote(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "feedback"):
      if (false !== (await checkAuth(msg, "feedback"))) {
        await feedback(msg);
      }
      break;
    case hasEntrance(msg.text, "tools", "help"):
      await msg.bot.say(msg.sid, command.usage, msg.type, msg.uid, "\n");
      break;
    case hasEntrance(msg.text, "tools", "master"):
      await msg.bot.say(msg.sid, master.usage, msg.type, msg.uid, "\n");
      break;
  }
}

export { Plugin as run };
