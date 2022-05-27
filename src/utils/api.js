import fs from "fs";
import lodash from "lodash";
import fetch from "node-fetch";
import path from "path";
import { getDS } from "#utils/ds";

// XXX 之所以会有两个 API 域名，是因为米哈游在两个 API 域名之间反复横跳 :)
// https://github.com/Arondight/Adachi-BOT/issues/520
// https://github.com/Arondight/Adachi-BOT/issues/814
const m_API_DOMAINS = ["api-takumi", "api-takumi-record"].map((c) => `${c}.mihoyo.com`);
const m_API_PREFIXES = m_API_DOMAINS.map((c) => `https://${c}`);
const m_API_STATIC_PREFIX = "https://webstatic.mihoyo.com";
const m_API_BBS_PREFIX = "https://bbs-api.mihoyo.com";
const m_API = {
  FETCH_ROLE_ID: m_API_PREFIXES.map((c) => `${c}/game_record/app/card/wapi/getGameRecordCard`),
  FETCH_ROLE_INDEX: m_API_PREFIXES.map((c) => `${c}/game_record/app/genshin/api/index`),
  FETCH_ROLE_CHARACTERS: m_API_PREFIXES.map((c) => `${c}/game_record/app/genshin/api/character`),
  FETCH_GACHA_LIST: [`${m_API_STATIC_PREFIX}/hk4e/gacha_info/cn_gf01/gacha/list.json`],
  FETCH_GACHA_DETAIL: [`${m_API_STATIC_PREFIX}/hk4e/gacha_info/cn_gf01/{}/zh-cn.json`],
  FETCH_ABY_DETAIL: m_API_PREFIXES.map((c) => `${c}/game_record/app/genshin/api/spiralAbyss`),
  FETCH_MYS_NEWS: [`${m_API_BBS_PREFIX}/post/wapi/getNewsList`],
};
const m_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.11.1",
  Referer: "https://webstatic.mihoyo.com/",
  "x-rpc-app_version": "2.11.1",
  "x-rpc-client_type": 5,
  DS: "",
  Cookie: "",
};

function getInfo(name) {
  const dir = path.resolve(global.rootdir, "resources", "Version2", "info", "docs");

  return new Promise((resolve, reject) => {
    try {
      const file = path.resolve(dir, `${name}.json`);
      resolve(JSON.parse(fs.readFileSync(file)));
    } catch (e) {
      reject(e);
    }
  });
}

function getEmoticons() {
  const dir = path.resolve(global.rootdir, "resources", "Version2", "emoticons");

  return new Promise((resolve, reject) => {
    try {
      const file = path.resolve(dir, "config.json");
      resolve(JSON.parse(fs.readFileSync(file)));
    } catch (e) {
      reject(e);
    }
  });
}

function getAbyDetail(role_id, schedule_type, server, cookie) {
  const query = { role_id, schedule_type, server };
  const promises = m_API.FETCH_ABY_DETAIL.map((c) =>
    fetch(`${c}?${new URLSearchParams(query)}`, {
      method: "GET",
      headers: { ...m_HEADERS, DS: getDS(query), Cookie: cookie },
    }).then((res) => res.json())
  );

  return Promise.any(promises);
}

function getBase(uid, cookie) {
  const query = { uid };
  const promises = m_API.FETCH_ROLE_ID.map((c) =>
    fetch(`${c}?${new URLSearchParams(query)}`, {
      method: "GET",
      headers: { ...m_HEADERS, DS: getDS(query), Cookie: cookie },
    }).then((res) => res.json())
  );

  return Promise.any(promises);
}

function getIndex(role_id, server, cookie) {
  const query = { role_id, server };
  const promises = m_API.FETCH_ROLE_INDEX.map((c) =>
    fetch(`${c}?${new URLSearchParams(query)}`, {
      method: "GET",
      qs: query,
      headers: { ...m_HEADERS, DS: getDS(query), Cookie: cookie },
    }).then((res) => res.json())
  );

  return Promise.any(promises);
}

function getCharacters(role_id, server, character_ids, cookie) {
  const body = { character_ids, role_id, server };
  const promises = m_API.FETCH_ROLE_CHARACTERS.map((c) =>
    fetch(c, {
      method: "POST",
      json: true,
      body: JSON.stringify(body),
      headers: {
        ...m_HEADERS,
        DS: getDS(undefined, JSON.stringify(body)),
        Cookie: cookie,
        "content-type": "application/json",
      },
    }).then((res) => res.json())
  );

  return Promise.any(promises);
}

function getGachaList() {
  const promises = m_API.FETCH_GACHA_LIST.map((c) =>
    fetch(c, {
      method: "GET",
      headers: lodash.pick(m_HEADERS, ["DS", "Cookie"]),
    }).then((res) => res.json())
  );

  return Promise.any(promises);
}

function getGachaDetail(gachaID) {
  const promises = m_API.FETCH_GACHA_DETAIL.map((c) =>
    fetch(c.replace("{}", gachaID), {
      method: "GET",
      headers: lodash.pick(m_HEADERS, ["DS", "Cookie"]),
    }).then((res) => res.json())
  );

  return Promise.any(promises);
}

function getMysNews(type = 1) {
  const query = { gids: 2, page_size: 10, type };
  const promises = m_API.FETCH_MYS_NEWS.map((c) =>
    fetch(`${c}?${new URLSearchParams(query)}`, {
      method: "GET",
      qs: query,
      headers: lodash.pick(m_HEADERS, ["DS", "Cookie"]),
    }).then((res) => res.json())
  );

  return Promise.any(promises);
}

export {
  getAbyDetail,
  getBase,
  getCharacters,
  getEmoticons,
  getGachaDetail,
  getGachaList,
  getIndex,
  getInfo,
  getMysNews,
};
