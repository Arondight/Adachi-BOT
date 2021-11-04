import { hasEntrance } from "../../utils/config.js";
import { boardcast } from "./boardcast.js";
import { count } from "./count.js";
import { reply } from "./reply.js";
import { search } from "./search.js";
import { status } from "./status.js";
import { cookiesInvalid } from "./cookies_invalid.js";

async function Plugin(msg, bot) {
  switch (true) {
    case hasEntrance(msg.text, "tools_master", "group_boardcast", "private_boardcast"):
      boardcast(msg.sid, msg.text, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools_master", "reply"):
      reply(msg.sid, msg.text, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools_master", "group_search", "private_search", "search"):
      search(msg.sid, msg.text, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools_master", "count"):
      count(msg.sid, msg.text, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools_master", "status"):
      status(msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "tools_master", "cookies_invalid"):
      cookiesInvalid(msg.sid, msg.type, msg.uid, bot);
      break;
  }
}

export { Plugin as run };
