import { setAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { gachaUpdate } from "../../utils/update.js";
import { parse } from "./parse.js";
import { setReplyAuth } from "./reply_auth.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "master", "feedback_auth"):
      setAuth(msg, ["feedback"], ...parse(msg.text, "feedback_auth"));
      break;
    case hasEntrance(msg.text, "master", "music_auth"):
      setAuth(msg, ["music", "music_source"], ...parse(msg.text, "music_auth"));
      break;
    case hasEntrance(msg.text, "master", "gacha_auth"):
      setAuth(msg, ["gacha", "pool", "select", "select-nothing", "select-what"], ...parse(msg.text, "gacha_auth"));
      break;
    case hasEntrance(msg.text, "master", "artifact_auth"):
      setAuth(msg, ["artifacts", "strengthen", "dungeons"], ...parse(msg.text, "artifact_auth"));
      break;
    case hasEntrance(msg.text, "master", "rating_auth"):
      setAuth(msg, ["rating"], ...parse(msg.text, "rating_auth"));
      break;
    case hasEntrance(msg.text, "master", "query_gameinfo_auth"):
      setAuth(
        msg,
        ["save", "change", "aby", "lastaby", "card", "package", "character", "others_character"],
        ...parse(msg.text, "query_gameinfo_auth")
      );
      break;
    case hasEntrance(msg.text, "master", "character_overview_auth"):
      setAuth(msg, ["info", "weapon", "talent", "weekly"], ...parse(msg.text, "character_overview_auth"));
      break;
    case hasEntrance(msg.text, "master", "fun_auth"):
      setAuth(msg, ["menu", "prophecy", "roll", "quote"], ...parse(msg.text, "fun_auth"));
      break;
    case hasEntrance(msg.text, "master", "reply_auth"):
      setReplyAuth(msg);
      break;
    case hasEntrance(msg.text, "master", "mys_news_auth"):
      setAuth(msg, global.innerAuthName.mysNews, ...parse(msg.text, "mys_news_auth"));
      break;
    case hasEntrance(msg.text, "master", "refresh_wish_detail"):
      msg.bot.say(msg.sid, `卡池内容${gachaUpdate() ? "已刷新" : "刷新失败"}。`, msg.type, msg.uid, true);
      break;
  }
}

export { Plugin as run };
