/* global command, master */
/* eslint no-undef: "error" */

import { hasEntrance } from "../../utils/config.js";
import { feedback } from "./feedback.js";
import { menu } from "./menu.js";
import { prophecy } from "./prophecy.js";
import { quote } from "./quote.js";
import { roll } from "./roll.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const groupName = "group" === type ? Message.group_name : undefined;

  switch (true) {
    case hasEntrance(msg, "tools", "menu"):
      menu(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "prophecy"):
      prophecy(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "roll"):
      roll(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "quote"):
      quote(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "feedback"):
      feedback(sendID, name, msg, type, userID, groupName, bot);
      break;
    case hasEntrance(msg, "tools", "help"):
      await bot.sendMessage(sendID, command.usage, type, userID, "\n");
      break;
    case hasEntrance(msg, "tools", "master"):
      await bot.sendMessage(sendID, master.usage, type, userID, "\n");
      break;
  }
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
