import db from "#utils/database";
import { textOfInvalidCookies } from "#utils/cookie";

function cookiesInvalid(msg) {
  const text = textOfInvalidCookies();

  db.clean("cookies_invalid");
  msg.bot.say(msg.sid, text || "未发现无效 Cookie 。", msg.type, msg.uid, false, text ? "\n" : " ");
}

export { cookiesInvalid };
