import { setAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { gachaUpdate } from "../../utils/update.js";
import { parse } from "./parse.js";
import { setReplyAuth } from "./reply_auth.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "master", "feedback_auth"):
      await setAuth(msg, "feedback", ...parse(msg.text, "feedback_auth"));
      break;
    case hasEntrance(msg.text, "master", "music_auth"):
      await setAuth(msg, "music", ...parse(msg.text, "music_auth"));
      await setAuth(msg, "music_source", ...parse(msg.text, "music_auth"));
      break;
    case hasEntrance(msg.text, "master", "gacha_auth"):
      await setAuth(msg, "gacha", ...parse(msg.text, "gacha_auth"));
      await setAuth(msg, "pool", ...parse(msg.text, "gacha_auth"));
      await setAuth(msg, "select", ...parse(msg.text, "gacha_auth"));
      await setAuth(msg, "select-nothing", ...parse(msg.text, "gacha_auth"));
      await setAuth(msg, "select-what", ...parse(msg.text, "gacha_auth"));
      break;
    case hasEntrance(msg.text, "master", "artifact_auth"):
      await setAuth(msg, "artifacts", ...parse(msg.text, "artifact_auth"));
      await setAuth(msg, "strengthen", ...parse(msg.text, "artifact_auth"));
      await setAuth(msg, "dungeons", ...parse(msg.text, "artifact_auth"));
      break;
    case hasEntrance(msg.text, "master", "rating_auth"):
      await setAuth(msg, "rating", ...parse(msg.text, "rating_auth"));
      break;
    case hasEntrance(msg.text, "master", "query_gameinfo_auth"):
      await setAuth(msg, "save", ...parse(msg.text, "query_gameinfo_auth"));
      await setAuth(msg, "change", ...parse(msg.text, "query_gameinfo_auth"));
      await setAuth(msg, "aby", ...parse(msg.text, "query_gameinfo_auth"));
      await setAuth(msg, "lastaby", ...parse(msg.text, "query_gameinfo_auth"));
      await setAuth(msg, "card", ...parse(msg.text, "query_gameinfo_auth"));
      await setAuth(msg, "package", ...parse(msg.text, "query_gameinfo_auth"));
      await setAuth(msg, "character", ...parse(msg.text, "query_gameinfo_auth"));
      await setAuth(msg, "others_character", ...parse(msg.text, "query_gameinfo_auth"));
      break;
    case hasEntrance(msg.text, "master", "character_overview_auth"):
      await setAuth(msg, "info", ...parse(msg.text, "character_overview_auth"));
      await setAuth(msg, "weapon", ...parse(msg.text, "character_overview_auth"));
      await setAuth(msg, "talent", ...parse(msg.text, "character_overview_auth"));
      await setAuth(msg, "weekly", ...parse(msg.text, "character_overview_auth"));
      break;
    case hasEntrance(msg.text, "master", "fun_auth"):
      await setAuth(msg, "menu", ...parse(msg.text, "fun_auth"));
      await setAuth(msg, "prophecy", ...parse(msg.text, "fun_auth"));
      await setAuth(msg, "roll", ...parse(msg.text, "fun_auth"));
      await setAuth(msg, "quote", ...parse(msg.text, "fun_auth"));
      break;
    case hasEntrance(msg.text, "master", "reply_auth"):
      await setReplyAuth(msg);
      break;
    case hasEntrance(msg.text, "master", "refresh_wish_detail"):
      gachaUpdate();
      await msg.bot.say(msg.sid, "卡池内容已刷新。", msg.type, msg.uid);
      break;
  }
}

export { Plugin as run };
