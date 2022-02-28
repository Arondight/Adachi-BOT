import lodash from "lodash";
import path from "path";
import db from "#utils/database";

const cookies = global.cookies || [];
let index = 0;

function increaseIndex() {
  index = index === cookies.length - 1 ? 0 : index + 1;
}

function isValidCookie(cookie) {
  // XXX 是否要使用某个 API 真正地去验证 Cookie 合法性？
  // 优点：真正地能区分 Cookie 是否有效
  // 缺点：依赖网络并且耗时较多
  if ("string" === typeof cookie && cookie.match(/cookie_token=\w+?\b/) && cookie.match(/account_id=\w+?\b/)) {
    return true;
  }

  return false;
}

function getEffectiveCookie(uid, s, use_cookie) {
  const dbName = "cookies";
  let p = index;
  increaseIndex();

  p = p === cookies.length - 1 ? 0 : p + 1;

  const cookie = cookies[p];
  const today = new Date().toLocaleDateString();

  if (!isValidCookie(cookie)) {
    return undefined;
  }

  if (!db.includes(dbName, "cookie", { cookie })) {
    const initData = { cookie, date: today, times: 0 };
    db.push(dbName, "cookie", initData);
  }

  let { date, times } = db.get(dbName, "cookie", { cookie }) || {};

  if (date && date === today && times && times >= 30) {
    return s >= cookies.length ? cookie : getEffectiveCookie(uid, s + 1, use_cookie);
  }

  if (date && date !== today) {
    times = 0;
  }

  date = today;
  times = times ? times + 1 : 1;

  if (use_cookie) {
    db.update(dbName, "cookie", { cookie }, { date, times });
  }

  db.update(dbName, "uid", { uid }, lodash.assign({ date, cookie }, use_cookie ? { times } : {}));

  return cookie;
}

function getCookie(uid, use_cookie, bot) {
  const dbName = "cookies";

  if (!db.includes(dbName, "uid", { uid })) {
    const initData = { uid, date: "", cookie: "", times: 0 };
    db.push(dbName, "uid", initData);
  }

  let { date, cookie } = db.get(dbName, "uid", { uid }) || {};
  const today = new Date().toLocaleDateString();

  if (!(date && cookie && date === today)) {
    cookie = getEffectiveCookie(uid, 1, use_cookie);
  }

  if (!cookie) {
    throw "无法获取可用 Cookie ！";
  }

  bot.logger.debug(`Cookie： ${uid} -> ${cookie}`);
  return cookie;
}

function markCookieUnusable(cookie) {
  const dbName = "cookies";

  if (cookie && db.includes(dbName, "cookie", { cookie })) {
    let { times } = db.get(dbName, "cookie", { cookie }) || {};

    // Cookie 标记为无效
    db.update(dbName, "cookie", { cookie }, { times: Number.MAX_SAFE_INTEGER });

    // 删除最后一个绑定关系
    if (times) {
      db.remove(dbName, "uid", { cookie, times });
    }
  }
}

function writeInvalidCookie(cookie) {
  const dbName = "cookies_invalid";
  const dbCookieName = "cookies";

  if ("string" === typeof cookie) {
    const [cookie_token] = cookie.match(/cookie_token=\w+?\b/) || [];
    const [account_id] = cookie.match(/account_id=\w+?\b/) || [];

    if (cookie_token && account_id) {
      if (!db.includes(dbName, "cookie", { cookie })) {
        const initData = { cookie, cookie_token, account_id };
        db.push(dbName, "cookie", initData);
      }

      markCookieUnusable(cookie);

      // 删除该 Cookie 所有的使用记录
      if (db.includes(dbCookieName, "uid", { cookie })) {
        db.remove(dbCookieName, "uid", { cookie });
      }
    }
  }
}

function textOfInvalidCookies() {
  const dbName = "cookies_invalid";
  const config = path.resolve("config", "cookies.yml");
  const data = db.get(dbName, "cookie") || [];
  let text = "";

  for (const cookie of data) {
    if (cookie.cookie_token && cookie.account_id) {
      text += `\n${cookie.account_id}`;
    }
  }

  text && (text = `发现以下无效 Cookie ，请及时在 ${config} 中删除。${text}`);
  return text;
}

function warnInvalidCookie(cookie) {
  if ("string" === typeof cookie) {
    const dbName = "cookies_invalid";
    db.clean(dbName);
    writeInvalidCookie(cookie);
    return textOfInvalidCookies();
  }
}

// From https://github.com/thesadru/genshinstats/blob/master/genshinstats/errors.py
// -----------------------------------------------------------------------------
// retcode  readable description (not the response message)
// -----------------------------------------------------------------------------
//
// general
//
// 10101:   Cannnot get data for more than 30 accounts per cookie per day.
// -100:    Login cookies have not been provided or are incorrect.
// 10001:   Login cookies have not been provided or are incorrect.
// 10102:   User's data is not public.
// 1009:    Could not find user; uid may not be valid.
// -1:      Internal database error, see original message.
// -10002:  Cannot get rewards info. Account has no game account binded to it.
// -108:    Language is not valid.
// 10103:   Cookies are correct but do not have a hoyolab account bound to them.
//
// code redemption
//
// -2003:   Invalid redemption code.
// -2017:   Redemption code has been claimed already.
// -2001:   Redemption code has expired.
// -2021:   Cannot claim codes for account with adventure rank lower than 10.
// -1073:   Cannot claim code. Account has no game account bound to it.
// -1071:   Login cookies from redeem_code() have not been provided or are incorrect.
//          Make sure you use account_id and cookie_token cookies.
//
// sign in
//
// -5003:   Already claimed daily reward today.
// 2001:    Already checked into hoyolab today.
//
// gacha log
//
// -100:    Authkey is not valid. (if message is "authkey error")
//          Login cookies have not been provided or are incorrect. (if message is not "authkey error")
// -101:    Authkey has timed-out. Update it by opening the history page in Genshin.
function tryToWarnInvalidCookie(retcode, cookie) {
  const invalidCode = [-100, 10001];
  const maxTimeCode = [10101];
  let retVal;

  if ("string" === typeof cookie && 0 !== retcode) {
    switch (true) {
      case invalidCode.includes(retcode):
        retVal = warnInvalidCookie(cookie);
        break;
      case maxTimeCode.includes(retcode):
        retVal = markCookieUnusable(cookie);
        break;
    }
  }

  return retVal;
}

export { getCookie, textOfInvalidCookies, tryToWarnInvalidCookie };
