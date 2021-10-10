import db from "./database.js";
import { loadYML } from "./yaml.js";

const configs = loadYML("cookies");
const cookies = configs
  ? Array.isArray(configs["cookies"])
    ? configs["cookies"]
    : []
  : [];
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
    cookie.includes("account_id=") &&
    cookie.includes("cookie_token=")
  ) {
    return true;
  }

  return false;
}

async function getEffectiveCookie(uid, s, use_cookie) {
  return new Promise((resolve, reject) => {
    let p = index;
    increaseIndex();

    p = p === cookies.length - 1 ? 0 : p + 1;

    const cookie = cookies[p];
    const today = new Date().toLocaleDateString();

    if (!isValidCookie(cookie)) {
      resolve(undefined);
      return;
    }

    let hasCookie = false;
    db.includes("cookies", "cookie", "cookie", cookie).then((hasCookie = true));

    if (hasCookie) {
      const initData = { cookie: cookie, date: today, times: 0 };
      db.push("cookies", "cookie", initData).then();
    }

    let { date, times } = db.get("cookies", "cookie", { cookie }).then();

    if (date && date === today && times & (times >= 30)) {
      resolve(
        s >= cookies.length
          ? cookie
          : getEffectiveCookie(uid, s + 1, use_cookie).then()
      );
    } else {
      if (date && date != today) {
        times = 0;
      }

      date = today;
      times = times ? times + 1 : 1;

      if (use_cookie) {
        db.update("cookies", "cookie", { cookie }, { date, times }).then();
      }

      db.update("cookies", "uid", { uid }, { date, cookie }).then();
      resolve(cookie);
    }
  });
}

async function getCookie(uid, use_cookie, bot) {
  return new Promise((resolve, reject) => {
    let hasUID = false;
    db.includes("cookies", "uid", "uid", uid).then((hasUID = true));

    if (hasUID) {
      const initData = { uid, date: "", cookie: "" };
      db.push("cookies", "uid", initData).then();
    }

    let { date, cookie } = db.get("cookies", "uid", { uid }).then();
    const today = new Date().toLocaleDateString();

    if (!(date && cookie && date === today)) {
      cookie = getEffectiveCookie(uid, 1, use_cookie).then();
    }

    if (!cookie) {
      reject("获取 Cookie 失败！");
      return;
    }

    bot.logger.debug(`Cookie： ${uid} -> ${cookie}`);
    resolve(cookie);
  });
}

export { getCookie };
