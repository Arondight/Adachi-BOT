import { gachaUpdate } from "#jobs/gacha";
import { setAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

async function Plugin(msg) {
  function parse(text, func) {
    const id = parseInt(text.match(/[0-9]+/g)[0]);
    const isOn = text.includes(global.all.functions.options[func].on);

    return [id, isOn];
  }

  const all = [
    "artifact_auth",
    "character_overview_auth",
    "feedback_auth",
    "fun_auth",
    "gacha_auth",
    "music_auth",
    "mys_news_auth",
    "query_gameinfo_auth",
    "rating_auth",
    "reply_auth",
  ];

  if (hasEntrance(msg.text, "master", "refresh_wish_detail")) {
    msg.bot.say(msg.sid, `卡池内容${gachaUpdate() ? "已刷新" : "刷新失败"}。`, msg.type, msg.uid, true);
    return;
  }

  for (const auth of all) {
    if (hasEntrance(msg.text, "master", auth)) {
      setAuth(msg, global.authority.setting[auth] || [], ...parse(msg.text, auth));
      break;
    }
  }
}

export { Plugin as run };
