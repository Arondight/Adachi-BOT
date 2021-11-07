import { setAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { gachaUpdate } from "../../utils/update.js";
import { parse } from "./parse.js";
import { setReplyAuth } from "./reply_auth.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "master", "feedback_auth"):
      setAuth(msg, "feedback", ...parse(msg.text, "feedback_auth"));
      break;
    case hasEntrance(msg.text, "master", "music_auth"):
      setAuth(msg, "music", ...parse(msg.text, "music_auth"));
      setAuth(msg, "music_source", ...parse(msg.text, "music_auth"));
      break;
    case hasEntrance(msg.text, "master", "gacha_auth"):
      setAuth(msg, "gacha", ...parse(msg.text, "gacha_auth"));
      setAuth(msg, "pool", ...parse(msg.text, "gacha_auth"));
      setAuth(msg, "select", ...parse(msg.text, "gacha_auth"));
      setAuth(msg, "select-nothing", ...parse(msg.text, "gacha_auth"));
      setAuth(msg, "select-what", ...parse(msg.text, "gacha_auth"));
      break;
    case hasEntrance(msg.text, "master", "artifact_auth"):
      setAuth(msg, "artifacts", ...parse(msg.text, "artifact_auth"));
      setAuth(msg, "strengthen", ...parse(msg.text, "artifact_auth"));
      setAuth(msg, "dungeons", ...parse(msg.text, "artifact_auth"));
      break;
    case hasEntrance(msg.text, "master", "rating_auth"):
      setAuth(msg, "rating", ...parse(msg.text, "rating_auth"));
      break;
    case hasEntrance(msg.text, "master", "query_gameinfo_auth"):
      setAuth(msg, "save", ...parse(msg.text, "query_gameinfo_auth"));
      setAuth(msg, "change", ...parse(msg.text, "query_gameinfo_auth"));
      setAuth(msg, "aby", ...parse(msg.text, "query_gameinfo_auth"));
      setAuth(msg, "lastaby", ...parse(msg.text, "query_gameinfo_auth"));
      setAuth(msg, "card", ...parse(msg.text, "query_gameinfo_auth"));
      setAuth(msg, "package", ...parse(msg.text, "query_gameinfo_auth"));
      setAuth(msg, "character", ...parse(msg.text, "query_gameinfo_auth"));
      setAuth(msg, "others_character", ...parse(msg.text, "query_gameinfo_auth"));
      break;
    case hasEntrance(msg.text, "master", "character_overview_auth"):
      setAuth(msg, "info", ...parse(msg.text, "character_overview_auth"));
      setAuth(msg, "weapon", ...parse(msg.text, "character_overview_auth"));
      setAuth(msg, "talent", ...parse(msg.text, "character_overview_auth"));
      setAuth(msg, "weekly", ...parse(msg.text, "character_overview_auth"));
      break;
    case hasEntrance(msg.text, "master", "fun_auth"):
      setAuth(msg, "menu", ...parse(msg.text, "fun_auth"));
      setAuth(msg, "prophecy", ...parse(msg.text, "fun_auth"));
      setAuth(msg, "roll", ...parse(msg.text, "fun_auth"));
      setAuth(msg, "quote", ...parse(msg.text, "fun_auth"));
      break;
    case hasEntrance(msg.text, "master", "reply_auth"):
      setReplyAuth(msg);
      break;
    case hasEntrance(msg.text, "master", "refresh_wish_detail"):
      gachaUpdate();
      msg.bot.say(msg.sid, "卡池内容已刷新。", msg.type, msg.uid);
      break;
  }
}

export { Plugin as run };
