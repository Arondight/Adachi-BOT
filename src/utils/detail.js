/* global config */
/* eslint no-undef: "error" */

import moment from "moment-timezone";
import lodash from "lodash";
import db from "./database.js";
import { getCookie, getUserCookie } from "./cookie.js";
import { getBase, getDetail, getCharacters, getAbyDetail, getDailyNote } from "./api.js";

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

  if (!(await db.includes("time", "user", "note", uid))) {
    await db.push("time", "user", { note: uid, time: 0 });
  }

  if (!(await db.includes("info", "user", "uid", uid))) {
    const initData = {
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

async function abyPromise(uid, server, userID, schedule_type, bot) {
  await userInitialize(userID, uid, "", -1);
  await db.update("character", "user", { userID }, { uid });

  const nowTime = new Date().valueOf();
  const { time: lastTime } = (await db.get("time", "user", { aby: uid })) || {};
  const { data: dbData } = (await db.get("aby", "user", { uid })) || {};

  // 尝试使用缓存
  if (dbData) {
    // 第 31 期深渊开始的时刻
    const ftime = moment("2021-10-01T04:00:00").tz("Asia/Shanghai");
    // 查询的时刻
    const ntime = moment().tz("Asia/Shanghai");
    // 数据库中的期数
    const { schedule_id: db_schedule } = dbData || {};
    // 查询时的期数
    let this_schedule =
      31 +
      (ntime.year() - ftime.year()) * 12 * 2 +
      (ntime.month() - ftime.month()) * 2;

    // 如果查询的时刻过了每月的十五号凌晨四点，查询时的期数加一
    if (
      ntime.date() - ftime.date() + 1 > 15 ||
      (15 === ntime.date() && ntime.hours() >= ftime.hours())
    ) {
      this_schedule++;
    }

    // 如果查询上期深渊，期数减一
    this_schedule -= parseInt(schedule_type) - 1;

    // 如果查询的期数和数据库中的期数一致，尝试使用缓存
    if (
      db_schedule === this_schedule &&
      lastTime &&
      nowTime - lastTime < config.cacheAbyEffectTime * 60 * 60 * 1000
    ) {
      bot.logger.debug(
        `缓存：使用 ${uid} 在 ${config.cacheAbyEffectTime} 小时内的深渊记录缓存。`
      );
      return Promise.reject("");
    }
  }

  const cookie = await getCookie(uid, true, bot);
  const { retcode, message, data } = await getAbyDetail(
    uid,
    schedule_type,
    server,
    cookie
  );

  if (retcode !== 0) {
    return Promise.reject(`米游社接口报错: ${message}`);
  }

  if (!(await db.includes("aby", "user", "uid", uid))) {
    const initData = { uid, data: [] };
    await db.push("aby", "user", initData);
  }

  await db.update("aby", "user", { uid }, { data });
  await db.update("time", "user", { aby: uid }, { time: nowTime });
  bot.logger.debug(
    `缓存：新增 ${uid} 的深渊记录，缓存 ${config.cacheAbyEffectTime} 小时。`
  );

  return data;
}

async function basePromise(mhyID, userID, bot) {
  const cookie = await getCookie("MHY" + mhyID, false, bot);
  const { retcode, message, data } = await getBase(mhyID, cookie);

  const errInfo =
    "未查询到角色数据，请检查米哈游通行证是否有误或是否设置角色信息公开";

  if (retcode !== 0) {
    return Promise.reject(`米游社接口报错: ${message}`);
  } else if (!data.list || 0 === data.list.length) {
    return Promise.reject(errInfo);
  }

  const baseInfo = data.list.find((el) => 2 === el["game_id"]);

  if (!baseInfo) {
    return Promise.reject(errInfo);
  }

  const { game_role_id, nickname, region, level } = baseInfo;
  const uid = parseInt(game_role_id);
  await userInitialize(userID, uid, nickname, level);
  await db.update("info", "user", { uid }, { level, nickname });
  return [uid, region];
}

async function detailPromise(uid, server, userID, bot) {
  await userInitialize(userID, uid, "", -1);
  await db.update("character", "user", { userID }, { uid });

  const nowTime = new Date().valueOf();
  const { time } = await db.get("time", "user", { uid });

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

  const cookie = await getCookie(uid, true, bot);
  const { retcode, message, data } = await getDetail(uid, server, cookie);

  if (retcode !== 0) {
    await db.update(
      "info",
      "user",
      { uid },
      { message, retcode: parseInt(retcode) }
    );
    return Promise.reject(`米游社接口报错: ${message}`);
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

  const characterID = data.avatars.map((el) => el["id"]);
  return characterID;
}

async function characterPromise(uid, server, character_ids, bot) {
  const cookie = await getCookie(uid, true, bot);
  const { retcode, message, data } = await getCharacters(
    uid,
    server,
    character_ids,
    cookie
  );

  if (retcode !== 0) {
    return Promise.reject(`米游社接口报错: ${message}`);
  }

  let avatars = [];
  const characterList = data.avatars;

  for (const i in characterList) {
    if (characterList[i]) {
      const el = characterList[i];
      const base = lodash.omit(el, [
        "image",
        "weapon",
        "reliquaries",
        "constellations",
      ]);
      const weapon = lodash.omit(el.weapon, [
        "id",
        "type",
        "promote_level",
        "type_name",
      ]);
      let artifact = [];
      let constellationNum = 0;
      const constellations = el["constellations"].reverse();

      for (const level in constellations) {
        if (constellations[level]) {
          if (constellations[level]["is_actived"]) {
            constellationNum = constellations[level]["pos"];
            break;
          }
        }
      }

      for (const posID in el.reliquaries) {
        if (el.reliquaries[posID]) {
          const posInfo = lodash.omit(el.reliquaries[posID], [
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
  return;
}

async function notePromise(uid, server, userID, bot) {
    await userInitialize(userID, uid, "", -1);
    await db.update("character", "user", { userID }, { uid });

    const nowTime = new Date().valueOf();
    const { time: lastTime } = (await db.get("time", "user", { note: uid })) || {};
    const { data: dbData } = (await db.get("note", "user", { uid })) || {};

    // 尝试使用缓存
    if (dbData) {
        if (
            lastTime &&
            nowTime - lastTime < config.cacheAbyEffectTime * 60 * 60 * 1000
        ) {
            bot.logger.debug(
                `缓存：使用 ${uid} 在 ${config.cacheAbyEffectTime} 小时内的实时便笺。`
            );
            return Promise.reject("");
        }
    }

    const cookie = await getUserCookie(uid, bot);
    if (!cookie)
        return Promise.reject(`未设置私人cookie`);

    const { retcode, message, data } = await getDailyNote(
        uid,
        server,
        cookie
    );

    if (retcode !== 0) {
        return Promise.reject(`米游社接口报错: ${message}`);
    }

    if (!(await db.includes("note", "user", "uid", uid))) {
        const initData = { uid, data: [] };
        await db.push("note", "user", initData);
    }

    await db.update("note", "user", { uid }, { data });
    await db.update("time", "user", { note: uid }, { time: nowTime });
    bot.logger.debug(
        `缓存：新增 ${uid} 的实时便笺，缓存 ${config.cacheAbyEffectTime} 小时。`
    );

    return data;
}

export { abyPromise, basePromise, detailPromise, characterPromise, notePromise };
