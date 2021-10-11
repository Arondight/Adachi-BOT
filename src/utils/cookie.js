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
  let p = index;
  increaseIndex();

  p = p === cookies.length - 1 ? 0 : p + 1;

  const cookie = cookies[p];
  const today = new Date().toLocaleDateString();

  if (!isValidCookie(cookie)) {
    return undefined;
  }

  if (!(await db.includes("cookies", "cookie", "cookie", cookie))) {
    const initData = { cookie: cookie, date: today, times: 0 };
    await db.push("cookies", "cookie", initData);
  }

  let { date, times } = await db.get("cookies", "cookie", { cookie });

  if (date && date === today && times & (times >= 30)) {
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

  let { date, cookie } = await db.get("cookies", "uid", { uid });
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

export { getCookie };
