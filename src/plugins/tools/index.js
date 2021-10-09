import { hasEntrance } from "../../utils/config.js";
import { feedback } from "./feedback.js";
import { roll } from "./roll.js";

async function Plugin(Message, bot) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let groupName = "group" === type ? Message.group_name : undefined;

  switch (true) {
    case hasEntrance(msg, "tools", "feedback"):
      feedback(sendID, name, msg, type, userID, groupName, bot);
      break;
    case hasEntrance(msg, "tools", "roll"):
      roll(sendID, name, msg, type, userID, bot);
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
