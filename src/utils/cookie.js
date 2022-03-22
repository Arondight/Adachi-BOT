import path from "path";
import db from "#utils/database";

const m_MAX_ACCOUNTS_PRE_COOKIE = 30;

// 无需加锁
const mCookies = (global.cookies || [])
  .filter((c) => isValidCookieStr(c))
  .map((c) => ({
    cookie: c,
    cookie_token: getCookieItem(c, "cookie_token") || "",
    account_id: getCookieItem(c, "account_id") || "",
  }));
// 无需加锁
let mIndex = 0;

function increaseIndex() {
  return (mIndex = mIndex + 1 < mCookies.length ? mIndex + 1 : 0);
}

function getToday() {
  return new Date().toLocaleDateString();
}

function getCookieItem(cookieStr, item = "account_id") {
  if ("string" === typeof cookieStr) {
    const match = cookieStr.match(new RegExp(`(?<=${item}=)\\w+?\\b`)) || [];

    if (match.length > 0) {
      return match[0];
    }
  }
}

function isValidCookieStr(cookieStr) {
  return !!(
    "string" === typeof cookieStr &&
    getCookieItem(cookieStr, "cookie_token") &&
    getCookieItem(cookieStr, "account_id")
  );
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

  const myCookies = mCookies.filter((c) => mhyID === parseInt(c.account_id));

  if (myCookies.length > 0) {
    return myCookies[0];
  }
}

function writeNewCookieToDB(cookie) {
  const dbName = "cookies";
  const date = getToday();

  if (!db.includes(dbName, "cookie", { cookie: cookie.cookie })) {
    db.push(dbName, "cookie", {
      cookie: cookie.cookie,
      date,
      times: 0,
      cookie_token: cookie.cookie_token,
      account_id: cookie.account_id,
    });
  }
}

function updateCookiesDB(uid, cookie, times) {
  const dbName = "cookies";
  const date = getToday();

  db.update(dbName, "cookie", { cookie: cookie.cookie }, { date, times });

  if (undefined !== uid) {
    if (!db.includes(dbName, "uid", { uid })) {
      db.push(dbName, "uid", { uid });
    }

    db.update(
      dbName,
      "uid",
      { uid },
      { date, cookie: cookie.cookie, times, cookie_token: cookie.cookie_token, account_id: cookie.account_id }
    );
  }
}

function getEffectiveCookie(uid, i, use) {
  if (0 === mCookies.length) {
    return;
  }

  // 因为 Cookie 可能有项目外的损耗（例如被米游社使用），
  // 所以在策略上尽量平均化 Cookie 池使用次数
  const cookie = mCookies[increaseIndex()];

  writeNewCookieToDB(cookie);

  const today = getToday();
  const dbName = "cookies";
  let { date, times } = db.get(dbName, "cookie", { cookie: cookie.cookie }) || {};

  if (date === today) {
    if (times >= m_MAX_ACCOUNTS_PRE_COOKIE) {
      // Cookie 池完整遍历仍未找到可用 Cookie ，此时**必须停止递归**
      if (i > mCookies.length) {
        // 由调用者抛出异常
        return;
      }

      return getEffectiveCookie(uid, i + 1, use);
    }
  } else {
    // 此时 Cookie 可直接使用
    times = 0;
  }

  if (true === use) {
    updateCookiesDB(uid, cookie, times + 1);
  }

  return cookie;
}

function getCookie(uid, use, bot) {
  if ("string" === typeof uid) {
    uid = parseInt(uid);
  }

  // THIS IS THE LAW
  if (undefined === uid) {
    use = false;
  }

  const cookieByID = getCookieByID(uid);
  let cookieStr;

  if (undefined === cookieByID) {
    // 给出 uid 则尝试使用已绑定的 Cookie
    if (!isNaN(uid)) {
      const dbName = "cookies";
      const today = getToday();
      const record = db.get(dbName, "uid", { uid }) || {};

      if (record.date === today && isValidCookieStr(record.cookie)) {
        return record.cookie;
      }
    }

    // 获取一个新 Cookie
    cookieStr = (getEffectiveCookie(uid, 0, use) || {}).cookie;
  } else {
    cookieStr = cookieByID.cookie;
  }

  if (isValidCookieStr(cookieStr)) {
    bot.logger.debug(`Cookie：${undefined === uid ? "" : " " + uid + " -> "}${cookieStr}`);

    return cookieStr;
  }

  throw "无法获取可用 Cookie ！";
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
