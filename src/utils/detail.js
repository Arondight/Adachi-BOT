import lodash from "lodash";
import { loadYML } from "./load.js";
import { get, isInside, push, update } from "./database.js";
import { getBase, getDetail, getCharacters, getAbyDetail } from "./api.js";

let index = 0;
const { cookies } = loadYML("cookies");

async function userInitialize(userID, uid, nickname, level) {
  if (!(await isInside("character", "user", "userID", userID))) {
    await push("character", "user", { userID, uid: 0 });
  }

  if (!(await isInside("time", "user", "uid", uid))) {
    await push("time", "user", { uid, time: 0 });
  }

  if (!(await isInside("info", "user", "uid", uid))) {
    let initData = {
      retcode: 19260817,
      message: "init message",
      uid,
      nickname,
      level,
      avatars: [],
      explorations: [],
      stats: {},
    };
    await push("info", "user", initData);
  }
}

function increaseIndex() {
  let cookiesNum = cookies.length;
  index = index === cookiesNum - 1 ? 0 : index + 1;
}

async function getEffectiveCookie(uid, s, use_cookie) {
  return new Promise(async (resolve, reject) => {
    let p = index;
    increaseIndex();
    p = p === cookies.length - 1 ? 0 : p + 1;
    let cookie = cookies[p];
    let today = new Date().toLocaleDateString();

    if (!(await isInside("cookies", "cookie", "cookie", cookie))) {
      let initData = {
        cookie: cookie,
        date: today,
        times: 0,
      };
      await push("cookies", "cookie", initData);
    }

    let { date, times } = await get("cookies", "cookie", { cookie });

    if (date && date == today && times & (times >= 30)) {
      if (s >= cookies.length) {
        resolve(cookie);
      } else {
        resolve(await getEffectiveCookie(uid, s + 1, use_cookie));
      }
    } else {
      if (date && date != today) {
        times = 0;
      }

      date = today;

      if (times) {
        times += 1;
      } else {
        times = 1;
      }

      if (use_cookie) {
        await update("cookies", "cookie", { cookie }, { date, times });
      }

      await update("cookies", "uid", { uid }, { date, cookie });
      resolve(cookie);
      return;
    }
  });
}

async function getCookie(uid, use_cookie) {
  return new Promise(async (resolve, reject) => {
    if (!(await isInside("cookies", "uid", "uid", uid))) {
      let initData = {
        uid: uid,
        date: "",
        cookie: "",
      };
      await push("cookies", "uid", initData);
    }

    let { date, cookie } = await get("cookies", "uid", { uid });
    let today = new Date().toLocaleDateString();

    if (date && cookie && date == today) {
    } else {
      cookie = await getEffectiveCookie(uid, 1, use_cookie);
    }

    if (!cookie) {
      reject("获取cookie失败！");
      return;
    }

    bot.logger.debug("Cookie: " + uid + " -> " + cookie);
    resolve(cookie);
  });
}

async function abyPromise(uid, server, schedule_type) {
  const { retcode, message, data } = await getAbyDetail(
    uid,
    schedule_type,
    server,
    await getCookie(uid, true)
  );
  return new Promise(async (resolve, reject) => {
    if (retcode !== 0) {
      reject("米游社接口报错: " + message);
      return;
    }

    if (!(await isInside("aby", "user", "uid", uid))) {
      let initData = {
        uid,
        data: [],
      };
      await push("aby", "user", initData);
    }

    await update("aby", "user", { uid }, { data });
    resolve(data);
  });
}

async function basePromise(mhyID, userID) {
  const { retcode, message, data } = await getBase(
    mhyID,
    await getCookie("MHY" + mhyID, false)
  );
  return new Promise(async (resolve, reject) => {
    if (retcode !== 0) {
      reject("米游社接口报错: " + message);
      return;
    } else if (!data.list || data.list.length === 0) {
      reject(
        "未查询到角色数据，请检查米哈游通行证是否有误或是否设置角色信息公开"
      );
      return;
    }

    let baseInfo = data.list.find((el) => el["game_id"] === 2);

    if (!baseInfo) {
      reject(
        "未查询到角色数据，请检查米哈游通行证是否有误或是否设置角色信息公开"
      );
      return;
    }

    let { game_role_id, nickname, region, level } = baseInfo;
    let uid = parseInt(game_role_id);
    await userInitialize(userID, uid, nickname, level);
    await update("info", "user", { uid }, { level, nickname });
    resolve([uid, region]);
  });
}

async function detailPromise(uid, server, userID) {
  await userInitialize(userID, uid, "", -1);
  await update("character", "user", { userID }, { uid });
  let nowTime = new Date().valueOf();
  let { time } = await get("time", "user", { uid });

  if (nowTime - time < 60 * 60 * 1000) {
    bot.logger.info(
      "用户 " + uid + " 在一小时内进行过查询操作，将返回上次数据"
    );
    const { retcode, message } = await get("info", "user", { uid });

    if (retcode !== 0) {
      return Promise.reject("米游社接口报错: " + message);
    }

    return Promise.reject("");
  }

  const { retcode, message, data } = await getDetail(
    uid,
    server,
    await getCookie(uid, true)
  );
  return new Promise(async (resolve, reject) => {
    if (retcode !== 0) {
      await update(
        "info",
        "user",
        { uid },
        { message, retcode: parseInt(retcode) }
      );
      reject("米游社接口报错: " + message);
      return;
    }

    await update("time", "user", { uid }, { time: nowTime });
    await update(
      "info",
      "user",
      { uid },
      {
        message,
        retcode: parseInt(retcode),
        explorations: data.world_explorations,
        stats: data.stats,
        homes: data.homes,
      }
    );
    bot.logger.info("用户 " + uid + " 查询成功，数据已缓存");
    let characterID = data.avatars.map((el) => el["id"]);
    resolve(characterID);
  });
}

async function characterPromise(uid, server, character_ids) {
  const { retcode, message, data } = await getCharacters(
    uid,
    server,
    character_ids,
    await getCookie(uid, true)
  );
  return new Promise(async (resolve, reject) => {
    if (retcode !== 0) {
      reject("米游社接口报错: " + message);
      return;
    }

    let avatars = [];
    let characterList = data.avatars;

    for (let i in characterList) {
      if (characterList.hasOwnProperty(i)) {
        let el = characterList[i];
        let base = lodash.omit(el, [
          "image",
          "weapon",
          "reliquaries",
          "constellations",
        ]);
        let weapon = lodash.omit(el.weapon, [
          "id",
          "type",
          "promote_level",
          "type_name",
        ]);
        let artifact = [],
          constellationNum = 0;
        let constellations = el["constellations"].reverse();

        for (let level in constellations) {
          if (constellations.hasOwnProperty(level)) {
            if (constellations[level]["is_actived"]) {
              constellationNum = constellations[level]["pos"];
              break;
            }
          }
        }

        for (let posID in el.reliquaries) {
          if (el.reliquaries.hasOwnProperty(posID)) {
            let posInfo = lodash.omit(el.reliquaries[posID], [
              "id",
              "set",
              "pos_name",
            ]);
            artifact.push(posInfo);
          }
        }

        avatars.push({ ...base, weapon, artifact, constellationNum });
      }
    }

    await update("info", "user", { uid }, { avatars });
    resolve();
  });
}

export { abyPromise, basePromise, detailPromise, characterPromise };
