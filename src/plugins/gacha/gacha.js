import { gachaTimes } from "#plugins/gacha/data";
import { init } from "#plugins/gacha/init";
import { render } from "#utils/render";

function doGacha(msg, times = 10) {
  init(msg.uid);

  const result = gachaTimes(msg.uid, msg.name, times);

  if ("string" === typeof result) {
    msg.bot.say(msg.sid, result, msg.type, msg.uid, true);
    return;
  }

  render(msg, result, "genshin-gacha");
}

export { doGacha };
