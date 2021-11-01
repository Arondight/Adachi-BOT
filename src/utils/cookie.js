/* global config */
/* eslint no-undef: "error" */

import path from "path";
import lodash from "lodash";
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
  const dbName = "cookies";
  let p = index;
  increaseIndex();

  p = p === cookies.length - 1 ? 0 : p + 1;

  const cookie = cookies[p];
  const today = new Date().toLocaleDateString();

  if (!isValidCookie(cookie)) {
    return undefined;
  }

  if (!(await db.includes(dbName, "cookie", "cookie", cookie))) {
    const initData = { cookie, date: today, times: 0 };
    await db.push(dbName, "cookie", initData);
  }

  let { date, times } = await db.get(dbName, "cookie", { cookie });

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
      await db.update(dbName, "cookie", { cookie }, { date, times });
    }

    await db.update(
      dbName,
      "uid",
      { uid },
      lodash.assign({ date, cookie }, use_cookie ? { times } : {})
    );

    return cookie;
  }
}

async function getCookie(uid, use_cookie, bot) {
  const dbName = "cookies";

  if (!(await db.includes(dbName, "uid", "uid", uid))) {
    const initData = { uid, date: "", cookie: "", times: 0 };
    await db.push(dbName, "uid", initData);
  }

  let { date, cookie } = (await db.get(dbName, "uid", { uid })) || {};
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

async function markCookieUnusable(cookie) {
  const dbName = "cookies";

  if (cookie && (await db.includes(dbName, "cookie", "cookie", cookie))) {
    let { times } = (await db.get(dbName, "cookie", { cookie })) || {};

    // Cookie 标记为无效
    await db.update(
      dbName,
      "cookie",
      { cookie },
      { times: COOKIE_TIMES_INVALID_MARK }
    );

    // 删除最后一个绑定关系
    if (times) {
      await db.remove(dbName, "uid", { cookie, times });
    }
  }
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
      await markCookieUnusable(cookie);

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
  const reachMaxTimeResponseList = ["access the genshin game records of up to"];

  if (cookie && message) {
    const errInfo = message.toLowerCase();

    for (const res of invalidResponseList.map((c) => c.toLowerCase())) {
      if ("" === errInfo || errInfo.includes(res)) {
        return await warnInvalidCookie(cookie);
      }
    }

    for (const res of reachMaxTimeResponseList.map((c) => c.toLowerCase())) {
      if (errInfo.includes(res)) {
        markCookieUnusable(cookie);
        return undefined;
      }
    }
  }

  return undefined;
}

export { getCookie, textOfInvalidCookies, tryToWarnInvalidCookie };
