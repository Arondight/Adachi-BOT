import { hasEntrance } from "../../utils/config.js";
import { boardcast } from "./boardcast.js";
import { count } from "./count.js";
import { feedback } from "./feedback.js";
import { reply } from "./reply.js";
import { roll } from "./roll.js";
import { search } from "./search.js";
import { status } from "./status.js";

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
    case hasEntrance(msg, "tools", "group_boardcast", "private_boardcast"):
      boardcast(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "reply"):
      reply(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "group_search", "private_search", "search"):
      search(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "count"):
      count(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools", "status"):
      status(sendID, type, userID, bot);
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
