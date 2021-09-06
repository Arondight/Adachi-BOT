const { randomString } = require("./tool");
const requests = require("./requests");
const fetch = require("node-fetch");
const md5 = require("md5");

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
    "https://api-takumi.mihoyo.com/game_record/genshin/api/spiralAbyss",
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

const getQueryParam = (data) => {
  if (data === undefined) {
    return "";
  }
  const arr = [];
  for (let key of Object.keys(data)) {
    arr.push(`${key}=${data[key]}`);
  }
  return arr.join("&");
}

const getDS = (query, body = "") => {
  const n = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs";
  const i = Date.now() / 1000 | 0;
  const r = randomString(6);
  const q = getQueryParam(query);
  const c = md5(`salt=${n}&t=${i}&r=${r}&b=${body}&q=${q}`);

  return `${i},${r},${c}`;
}

exports.getInfo = (name) => {
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
};

exports.getAbyDetail = (role_id, schedule_type, server, cookie) => {
  const query = { server, role_id, schedule_type };

  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_ABY_DETAIL,
      qs: query,
      headers: {
        ...HEADERS,
        DS: getDS(query),
        Cookie: cookie,
      },
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.getBase = (uid, cookie) => {
  const query = { uid };

  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_ROLE_ID,
      qs: query,
      headers: {
        ...HEADERS,
        DS: getDS(query),
        Cookie: cookie,
      },
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.getDetail = (role_id, server, cookie) => {
  const query = { server, role_id };

  return new Promise((resolve, reject) => {
    requests({
      method: "GET",
      url: __API.FETCH_ROLE_INDEX,
      qs: query,
      headers: {
        ...HEADERS,
        DS: getDS(query),
        Cookie: cookie,
      },
    })
      .then((res) => {
        resolve(JSON.parse(res));
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.getCharacters = (role_id, server, character_ids, cookie) => {
  const body = { character_ids, server, role_id };

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
};

exports.getGachaList = () => {
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
};

exports.getGachaDetail = (gachaID) => {
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
};
