import { hasEntrance } from "../../utils/config.js";
import { boardcast } from "./boardcast.js";
import { count } from "./count.js";
import { reply } from "./reply.js";
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
    case hasEntrance(
      msg,
      "tools_master",
      "group_boardcast",
      "private_boardcast"
    ):
      boardcast(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools_master", "reply"):
      reply(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(
      msg,
      "tools_master",
      "group_search",
      "private_search",
      "search"
    ):
      search(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools_master", "count"):
      count(sendID, msg, type, userID, bot);
      break;
    case hasEntrance(msg, "tools_master", "status"):
      status(sendID, type, userID, bot);
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
