import { setAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { gachaUpdate } from "../../utils/update.js";
import { parse } from "./parse.js";
import { setReplyAuth } from "./reply_auth.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "master", "feedback_auth"): {
      const parsed = parse(msg.text, "feedback_auth");
      setAuth(msg, "feedback", ...parsed);
      break;
    }
    case hasEntrance(msg.text, "master", "music_auth"): {
      const parsed = parse(msg.text, "music_auth");
      await setAuth(msg, "music", ...parsed);
      setAuth(msg, "music_source", ...parsed);
      break;
    }
    case hasEntrance(msg.text, "master", "gacha_auth"): {
      const parsed = parse(msg.text, "gacha_auth");
      await setAuth(msg, "gacha", ...parsed);
      await setAuth(msg, "pool", ...parsed);
      await setAuth(msg, "select", ...parsed);
      await setAuth(msg, "select-nothing", ...parsed);
      setAuth(msg, "select-what", ...parsed);
      break;
    }
    case hasEntrance(msg.text, "master", "artifact_auth"): {
      const parsed = parse(msg.text, "artifact_auth");
      await setAuth(msg, "artifacts", ...parsed);
      await setAuth(msg, "strengthen", ...parsed);
      setAuth(msg, "dungeons", ...parsed);
      break;
    }
    case hasEntrance(msg.text, "master", "rating_auth"): {
      const parsed = parse(msg.text, "rating_auth");
      setAuth(msg, "rating", ...parsed);
      break;
    }
    case hasEntrance(msg.text, "master", "query_gameinfo_auth"): {
      const parsed = parse(msg.text, "query_gameinfo_auth");
      await setAuth(msg, "save", ...parsed);
      await setAuth(msg, "change", ...parsed);
      await setAuth(msg, "aby", ...parsed);
      await setAuth(msg, "lastaby", ...parsed);
      await setAuth(msg, "card", ...parsed);
      await setAuth(msg, "package", ...parsed);
      await setAuth(msg, "character", ...parsed);
      setAuth(msg, "others_character", ...parsed);
      break;
    }
    case hasEntrance(msg.text, "master", "character_overview_auth"): {
      const parsed = parse(msg.text, "character_overview_auth");
      await setAuth(msg, "info", ...parsed);
      await setAuth(msg, "weapon", ...parsed);
      await setAuth(msg, "talent", ...parsed);
      setAuth(msg, "weekly", ...parsed);
      break;
    }
    case hasEntrance(msg.text, "master", "fun_auth"): {
      const parsed = parse(msg.text, "fun_auth");
      await setAuth(msg, "menu", ...parsed);
      await setAuth(msg, "prophecy", ...parsed);
      await setAuth(msg, "roll", ...parsed);
      setAuth(msg, "quote", ...parsed);
      break;
    }
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
