import db from "../../utils/database.js";
import { textOfInvalidCookies } from "../../utils/cookie.js";

function cookiesInvalid(msg) {
  const text = textOfInvalidCookies();

  db.clean("cookies_invalid");
  msg.bot.say(msg.sid, text || "未发现无效 Cookie 。", msg.type, msg.uid, text ? "\n" : " ");
}

export { cookiesInvalid };
