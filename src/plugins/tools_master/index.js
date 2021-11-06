import { hasEntrance } from "../../utils/config.js";
import { boardcast } from "./boardcast.js";
import { count } from "./count.js";
import { reply } from "./reply.js";
import { search } from "./search.js";
import { status } from "./status.js";
import { cookiesInvalid } from "./cookies_invalid.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "tools_master", "group_boardcast", "private_boardcast"):
      await boardcast(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "reply"):
      await reply(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "group_search", "private_search", "search"):
      await search(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "count"):
      await count(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "status"):
      await status(msg);
      break;
    case hasEntrance(msg.text, "tools_master", "cookies_invalid"):
      await cookiesInvalid(msg);
      break;
  }
}

export { Plugin as run };
