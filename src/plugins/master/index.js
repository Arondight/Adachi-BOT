import { gachaUpdate } from "#jobs/gacha";
import { setAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

async function Plugin(msg) {
  function parse(text, func) {
    const id = parseInt(text.match(/[0-9]+/g)[0]);
    const isOn = text.includes(global.all.functions.options[func].on);

    return [id, isOn];
  }

  if (hasEntrance(msg.text, "master", "refresh_wish_detail")) {
    msg.bot.say(msg.sid, `卡池内容${gachaUpdate() ? "已刷新" : "刷新失败"}。`, msg.type, msg.uid, true);
    return;
  }

  for (const auth of Object.keys(global.authority.default || [])) {
    if (hasEntrance(msg.text, "master", auth)) {
      setAuth(msg, global.authority.setting[auth] || [], ...parse(msg.text, auth));
      break;
    }
  }
}

export { Plugin as run };
