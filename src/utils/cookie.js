/* global config */
/* eslint no-undef: "error" */

import path from "path";
import db from "./database.js";

const COOKIE_TIMES_INVALID_MARK = 0xabadcafe;
const cookies = config.cookies || [];
let index = 0;

function increaseIndex() {
  index = index === cookies.length - 1 ? 0 : index + 1;
}

function isValidCookie(cookie) {
  // XXX 是否要使用某个 API 真正地去验证 Cookie 合法性？
  // 优点：真正地能区分 Cookie 是否有效
  // 缺点：依赖网络并且耗时较多
  if (
    "string" === typeof cookie &&
    cookie.match(/cookie_token=\w+?\b/) &&
    cookie.match(/account_id=\w+?\b/)
  ) {
    return true;
  }

  return false;
}

async function getEffectiveCookie(uid, s, use_cookie) {
  let p = index;
  increaseIndex();

  p = p === cookies.length - 1 ? 0 : p + 1;

  const cookie = cookies[p];
  const today = new Date().toLocaleDateString();

  if (!isValidCookie(cookie)) {
    return undefined;
  }

  if (!(await db.includes("cookies", "cookie", "cookie", cookie))) {
    const initData = { cookie, date: today, times: 0 };
    await db.push("cookies", "cookie", initData);
  }

  let { date, times } = await db.get("cookies", "cookie", { cookie });

  if (date && date === today && times && times >= 30) {
    return s >= cookies.length
      ? cookie
      : await getEffectiveCookie(uid, s + 1, use_cookie);
  } else {
    if (date && date != today) {
      times = 0;
    }

    date = today;
    times = times ? times + 1 : 1;

    if (use_cookie) {
      await db.update("cookies", "cookie", { cookie }, { date, times });
    }

    await db.update("cookies", "uid", { uid }, { date, cookie });
    return cookie;
  }
}

async function getCookie(uid, use_cookie, bot) {
  if (!(await db.includes("cookies", "uid", "uid", uid))) {
    const initData = { uid, date: "", cookie: "" };
    await db.push("cookies", "uid", initData);
  }

  let { date, cookie } = (await db.get("cookies", "uid", { uid })) || {};
  const today = new Date().toLocaleDateString();

  if (!(date && cookie && date === today)) {
    cookie = await getEffectiveCookie(uid, 1, use_cookie);
  }

  if (!cookie) {
    return Promise.reject("获取 Cookie 失败！");
  }

  bot.logger.debug(`Cookie： ${uid} -> ${cookie}`);
  return cookie;
}

async function writeInvalidCookie(cookie) {
  const dbName = "cookies_invalid";
  const dbCookieName = "cookies";
  const [cookie_token] = cookie.match(/cookie_token=\w+?\b/) || [];
  const [account_id] = cookie.match(/account_id=\w+?\b/) || [];

  if (cookie_token && account_id) {
    if (!(await db.includes(dbName, "cookie", "cookie", cookie))) {
      const initData = { cookie, cookie_token, account_id };
      await db.push(dbName, "cookie", initData);

      // 不再使用该 Cookie
      if (await db.includes(dbCookieName, "cookie", "cookie", cookie)) {
        await db.update(
          dbCookieName,
          "cookie",
          { cookie },
          { times: COOKIE_TIMES_INVALID_MARK }
        );
      }

      // 删除该 Cookie 所有的使用记录
      if (await db.includes(dbCookieName, "uid", "cookie", cookie)) {
        await db.remove(dbCookieName, "uid", { cookie });
      }
    }
  }
}

async function textOfInvalidCookies() {
  const dbName = "cookies_invalid";
  const config = path.join("config", "cookies.yml");
  const data = (await db.get(dbName, "cookie")) || [];
  let text = "";

  for (const cookie of data) {
    if (cookie.cookie_token && cookie.account_id) {
      text += `\n${cookie.account_id}; ${cookie.cookie_token}`;
    }
  }

  text && (text = `发现以下无效 Cookie ，请及时在 ${config} 中删除。${text}`);
  return text;
}

async function warnInvalidCookie(cookie) {
  const dbName = "cookies_invalid";
  await db.clean(dbName);
  await writeInvalidCookie(cookie);
  return await textOfInvalidCookies();
}

async function tryToWarnInvalidCookie(message, cookie) {
  const invalidResponseList = ["please login"];

  if (cookie && message) {
    const errInfo = message.toLowerCase();

    for (const res of invalidResponseList.map((c) => c.toLowerCase())) {
      if (errInfo.includes(res)) {
        return await warnInvalidCookie(cookie);
      }
    }
  }

  return undefined;
}

export { getCookie, textOfInvalidCookies, tryToWarnInvalidCookie };
