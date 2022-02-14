import { hasEntrance } from "#utils/config";
import { boardcast } from "./boardcast.js";
import { cookiesInvalid } from "./cookies_invalid.js";
import { count } from "./count.js";
import { reply } from "./reply.js";
import { search } from "./search.js";
import { status } from "./status.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "tools_master", "group_boardcast", "private_boardcast"):
      boardcast(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "reply"):
      reply(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "group_search", "private_search", "search"):
      search(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "count"):
      count(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "status"):
      status(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "cookies_invalid"):
      cookiesInvalid(msg);
      break;
  }
}

export { Plugin as run };
