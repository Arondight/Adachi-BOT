import md5 from "md5";
import requests from "./requests.js";
import { randomString } from "./tools.js";

const __API = {
  FETCH_ROLE_ID:
    "https://api-takumi.mihoyo.com/game_record/app/card/wapi/getGameRecordCard",
  FETCH_ROLE_INDEX:
    "https://api-takumi.mihoyo.com/game_record/app/genshin/api/index",
  FETCH_ROLE_CHARACTERS:
    "https://api-takumi.mihoyo.com/game_record/app/genshin/api/character",
  FETCH_GACHA_LIST:
    "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/gacha/list.json",
  FETCH_GACHA_DETAIL:
    "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/$/zh-cn.json",
  FETCH_ABY_DETAIL:
    "https://api-takumi.mihoyo.com/game_record/app/genshin/api/spiralAbyss",
  FETCH_INFO: "http://localhost:9934/resources/Version2/info/docs/$.json",
};
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.11.1",
  Referer: "https://webstatic.mihoyo.com/",
  "x-rpc-app_version": "2.11.1",
  "x-rpc-client_type": 5,
  DS: "",
  Cookie: "",
};

function getQueryParam(data) {
  let arr = [];

  if (data === undefined) {
    return "";
  }

  for (let key of Object.keys(data)) {
    arr.push(`${key}=${data[key]}`);
  }

  return arr.join("&");
}

function getDS(query, body = "") {
  let n = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs";
  let i = (Date.now() / 1000) | 0;
  let r = randomString(6);
  let q = getQueryParam(query);
  let c = md5(`salt=${n}&t=${i}&r=${r}&b=${body}&q=${q}`);
  return `${i},${r},${c}`;
}

function getInfo(name) {
  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_INFO.replace("$", encodeURI(name)),
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getAbyDetail(role_id, schedule_type, server, cookie) {
  const query = { role_id, schedule_type, server };

  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_ABY_DETAIL,
      qs: query,
      headers: { ...HEADERS, DS: getDS(query), Cookie: cookie },
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getBase(uid, cookie) {
  const query = { uid };

  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_ROLE_ID,
      qs: query,
      headers: { ...HEADERS, DS: getDS(query), Cookie: cookie },
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getDetail(role_id, server, cookie) {
  const query = { role_id, server };

  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_ROLE_INDEX,
      qs: query,
      headers: { ...HEADERS, DS: getDS(query), Cookie: cookie },
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getCharacters(role_id, server, character_ids, cookie) {
  const body = { character_ids, role_id, server };

  return new Promise((resolve, reject) => {
    requests({
      method: "POST",
      url: __API.FETCH_ROLE_CHARACTERS,
      json: true,
      body,
      headers: {
        ...HEADERS,
        DS: getDS(undefined, JSON.stringify(body)),
        Cookie: cookie,
        "content-type": "application/json",
      },
    })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getGachaList() {
  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_GACHA_LIST,
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getGachaDetail(gachaID) {
  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_GACHA_DETAIL.replace("$", gachaID),
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export {
  getInfo,
  getAbyDetail,
  getBase,
  getDetail,
  getCharacters,
  getGachaList,
  getGachaDetail,
};
