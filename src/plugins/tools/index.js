/* global command, master */
/* eslint no-undef: "error" */

import { hasEntrance } from "../../utils/config.js";
import { feedback } from "./feedback.js";
import { roll } from "./roll.js";
import { prophecy } from "./prophecy.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const groupName = "group" === type ? Message.group_name : undefined;

  switch (true) {
    case hasEntrance(msg, "tools", "feedback"):
      feedback(sendID, name, msg, type, userID, groupName, bot);
      break;
    case hasEntrance(msg, "tools", "roll"):
      roll(sendID, name, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "prophecy"):
      prophecy(sendID, name, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "help"):
      await bot.sendMessage(sendID, command.usage, type, userID);
      break;
    case hasEntrance(msg, "tools", "master"):
      await bot.sendMessage(sendID, master.usage, type, userID);
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
