import { boardcast } from "#plugins/tools_master/boardcast";
import { cookiesInvalid } from "#plugins/tools_master/cookies_invalid";
import { count } from "#plugins/tools_master/count";
import { reply } from "#plugins/tools_master/reply";
import { search } from "#plugins/tools_master/search";
import { status } from "#plugins/tools_master/status";
import { hasEntrance } from "#utils/config";

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
