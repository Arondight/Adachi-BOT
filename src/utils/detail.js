import lodash from "lodash";
import db from "./database.js";
import { loadYML } from "./yaml.js";
import { getCookie } from "./cookie.js";
import { getBase, getDetail, getCharacters, getAbyDetail } from "./api.js";

async function userInitialize(userID, uid, nickname, level) {
  if (!(await db.includes("character", "user", "userID", userID))) {
    await db.push("character", "user", { userID, uid: 0 });
  }

  if (!(await db.includes("time", "user", "uid", uid))) {
    await db.push("time", "user", { uid, time: 0 });
  }

  if (!(await db.includes("time", "user", "aby", uid))) {
    await db.push("time", "user", { aby: uid, time: 0 });
  }

  if (!(await db.includes("info", "user", "uid", uid))) {
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
    await db.push("info", "user", initData);
  }
}

async function abyPromise(uid, server, userID, schedule_type) {
  await userInitialize(userID, uid, "", -1);
  await db.update("character", "user", { userID }, { uid });
  let nowTime = new Date().valueOf();
  let { time } = await db.get("time", "user", { aby: uid });

  if (time && nowTime - time < config.cacheAbyEffectTime * 60 * 60 * 1000) {
    bot.logger.debug(
      `缓存：使用 ${uid} 在 ${config.cacheAbyEffectTime} 小时内的深渊记录缓存。`
    );
    const { data } = await db.get("aby", "user", { uid });

    if (!data) {
      return Promise.reject("没有查询到深渊数据。 ");
    }

    return Promise.reject("");
  }

  const cookie = await getCookie(uid, true);
  const { retcode, message, data } = await getAbyDetail(
    uid,
    schedule_type,
    server,
    cookie
  );

  return new Promise(async (resolve, reject) => {
    if (retcode !== 0) {
      reject(`米游社接口报错: ${message}`);
      return;
    }

    if (!(await db.includes("aby", "user", "uid", uid))) {
      let initData = { uid, data: [] };
      await db.push("aby", "user", initData);
    }

    await db.update("aby", "user", { uid }, { data });
    await db.update("time", "user", { aby: uid }, { time: nowTime });
    bot.logger.debug(
      `缓存：新增 ${uid} 的深渊记录，缓存 ${config.cacheAbyEffectTime} 小时。`
    );

    resolve(data);
  });
}

async function basePromise(mhyID, userID) {
  const cookie = await getCookie("MHY" + mhyID, false);
  const { retcode, message, data } = await getBase(mhyID, cookie);

  return new Promise(async (resolve, reject) => {
    if (retcode !== 0) {
      reject(`米游社接口报错: ${message}`);
      return;
    } else if (!data.list || 0 === data.list.length) {
      reject(
        "未查询到角色数据，请检查米哈游通行证是否有误或是否设置角色信息公开"
      );
      return;
    }

    let baseInfo = data.list.find((el) => 2 === el["game_id"]);

    if (!baseInfo) {
      reject(
        "未查询到角色数据，请检查米哈游通行证是否有误或是否设置角色信息公开"
      );
      return;
    }

    let { game_role_id, nickname, region, level } = baseInfo;
    let uid = parseInt(game_role_id);
    await userInitialize(userID, uid, nickname, level);
    await db.update("info", "user", { uid }, { level, nickname });
    resolve([uid, region]);
  });
}

async function detailPromise(uid, server, userID) {
  await userInitialize(userID, uid, "", -1);
  await db.update("character", "user", { userID }, { uid });
  let nowTime = new Date().valueOf();
  let { time } = await db.get("time", "user", { uid });

  if (time && nowTime - time < config.cacheInfoEffectTime * 60 * 60 * 1000) {
    bot.logger.debug(
      `缓存：使用 ${uid} 在 ${config.cacheInfoEffectTime} 小时内的玩家数据缓存。`
    );
    const { retcode, message } = await db.get("info", "user", { uid });

    if (retcode !== 0) {
      return Promise.reject(`米游社接口报错: ${message}`);
    }

    return Promise.reject("");
  }

  const cookie = await getCookie(uid, true);
  const { retcode, message, data } = await getDetail(uid, server, cookie);

  return new Promise(async (resolve, reject) => {
    if (retcode !== 0) {
      await db.update(
        "info",
        "user",
        { uid },
        { message, retcode: parseInt(retcode) }
      );
      reject(`米游社接口报错: ${message}`);
      return;
    }

    await db.update(
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
    await db.update("time", "user", { uid }, { time: nowTime });
    bot.logger.debug(
      `缓存：新增 ${uid} 的玩家数据，缓存 ${config.cacheInfoEffectTime} 小时。`
    );

    let characterID = data.avatars.map((el) => el["id"]);
    resolve(characterID);
  });
}

async function characterPromise(uid, server, character_ids) {
  const cookie = await getCookie(uid, true);
  const { retcode, message, data } = await getCharacters(
    uid,
    server,
    character_ids,
    cookie
  );

  return new Promise(async (resolve, reject) => {
    if (retcode !== 0) {
      reject(`米游社接口报错: ${message}`);
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

    await db.update("info", "user", { uid }, { avatars });
    resolve();
  });
}

export { abyPromise, basePromise, detailPromise, characterPromise };
