import db from "../../utils/database.js";
import { textOfInvalidCookies } from "../../utils/cookie.js";

async function cookiesInvalid(id, type, user, bot) {
  const dbName = "cookies_invalid";
  const text = await textOfInvalidCookies();

  await db.clean(dbName);
  await bot.sendMessage(
    id,
    text || "未发现无效 Cookie 。",
    type,
    user,
    text ? "\n" : " "
  );
  return;
}

export { cookiesInvalid };
