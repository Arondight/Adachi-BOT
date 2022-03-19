import lodash from "lodash";
import path from "path";
import db from "#utils/database";

// 无需加锁
const cookies = (global.cookies || [])
  .filter((c) => isValidCookie(c))
  .map((c) => ({
    cookie: c,
    cookie_token: getCookieItem(c, "cookie_token") || "",
    account_id: getCookieItem(c, "account_id") || "",
  }));
// 无需加锁
let index = 0;

function increaseIndex() {
  index = index === cookies.length - 1 ? 0 : index + 1;
}

function getCookieItem(cookie, item = "account_id") {
  if ("string" === typeof cookie) {
    const match = cookie.match(new RegExp(`(?<=${item}=)\\w+?\\b`)) || [];

    if (match.length > 0) {
      return match[0];
    }
  }
}

function isValidCookie(cookie) {
  return !!("string" === typeof cookie && getCookieItem(cookie, "cookie_token") && getCookieItem(cookie, "account_id"));
}

function getCookieByID(uid) {
  const dbName = "map";

  if (undefined === uid) {
    return;
  }

  const { mhyID } = db.get(dbName, "user", { UID: uid }) || {};

  if (undefined === mhyID) {
    return;
  }

  const myCookies = cookies.filter((c) => mhyID === parseInt(c.account_id));

  if (myCookies.length > 0) {
    return myCookies[0];
  }
}

function getEffectiveCookie(uid, s, use) {
  const dbName = "cookies";
  const today = new Date().toLocaleDateString();
  const cookieByID = getCookieByID(uid);
  let cookie;
  let token;
  let id;

  if (undefined === cookieByID) {
    let cur = index;

    increaseIndex();

    cur = cur === cookies.length - 1 ? 0 : cur + 1;
    cookie = cookies[cur].cookie;
    token = cookies[cur].cookie_token;
    id = cookies[cur].account_id;
  } else {
    cookie = cookieByID.cookie;
    token = cookieByID.cookie_token;
    id = cookieByID.account_id;
    use = false;
  }

  if (!db.includes(dbName, "cookie", { cookie })) {
    db.push(dbName, "cookie", { cookie, date: today, times: 0, cookie_token: token, account_id: id });
  }

  let { date, times } = db.get(dbName, "cookie", { cookie }) || {};

  if (date === today && times >= 30) {
    return s >= cookies.length ? cookie : getEffectiveCookie(uid, s + 1, use);
  }

  if (date !== today) {
    times = 0;
  }

  date = today;
  ++times;

  if (true === use) {
    db.update(dbName, "cookie", { cookie }, { date, times });

    if (undefined !== uid) {
      if (!db.includes(dbName, "uid", { uid })) {
        db.push(dbName, "uid", { uid, date: "", cookie: "", times: 0, cookie_token: token, account_id: id });
      }

      db.update(dbName, "uid", { uid }, lodash.assign({ date, cookie }, { times }));
    }
  }

  return cookie;
}

function getCookie(uid, use, bot) {
  const dbName = "cookies";
  let cookie;

  if ("string" === typeof uid) {
    uid = parseInt(uid);
  }

  // XXX THIS IS THE LAW
  if (undefined === uid) {
    use = false;
  }

  // 尝试根据给出的 uid 查找使用记录
  if (!isNaN(uid) && uid > 0) {
    const today = new Date().toLocaleDateString();
    const record = db.get(dbName, "uid", { uid }) || {};
    let date = record.date;

    cookie = record.cookie;

    if (date && date === today && isValidCookie(cookie)) {
      return cookie;
    }
  }

  // 没有给出 uid 或者未找到使用记录则获取一个新 cookie
  cookie = getEffectiveCookie(uid, 1, use);

  if (!cookie) {
    throw "无法获取可用 Cookie ！";
  }

  bot.logger.debug(`Cookie：${undefined === uid ? "" : " " + uid + " -> "}${cookie}`);

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
    const token = getCookieItem(cookie, "cookie_token") || "";
    const id = getCookieItem(cookie, "account_id") || "";

    if (!db.includes(dbName, "cookie", { cookie })) {
      db.push(dbName, "cookie", { cookie, cookie_token: token, account_id: id });
    }

    markCookieUnusable(cookie);

    // 删除该 Cookie 所有的使用记录
    if (db.includes(dbCookieName, "uid", { cookie })) {
      db.remove(dbCookieName, "uid", { cookie });
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
      text += `\naccount_id=${cookie.account_id}`;
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
        markCookieUnusable(cookie);
        break;
    }
  }

  return retVal;
}

export { getCookie, textOfInvalidCookies, tryToWarnInvalidCookie };
