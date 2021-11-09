import db from "../../utils/database.js";
import { textOfInvalidCookies } from "../../utils/cookie.js";

async function cookiesInvalid(msg) {
  const text = await textOfInvalidCookies();

  await db.clean("cookies_invalid");
  msg.bot.say(msg.sid, text || "未发现无效 Cookie 。", msg.type, msg.uid, text ? "\n" : " ");
}

export { cookiesInvalid };
