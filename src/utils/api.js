/* global rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { getDS } from "./ds.js";

const __API = {
  FETCH_ROLE_ID: "https://api-takumi.mihoyo.com/game_record/app/card/wapi/getGameRecordCard",
  FETCH_ROLE_INDEX: "https://api-takumi.mihoyo.com/game_record/app/genshin/api/index",
  FETCH_ROLE_CHARACTERS: "https://api-takumi.mihoyo.com/game_record/app/genshin/api/character",
  FETCH_GACHA_LIST: "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/gacha/list.json",
  FETCH_GACHA_DETAIL: "https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/$/zh-cn.json",
  FETCH_ABY_DETAIL: "https://api-takumi.mihoyo.com/game_record/app/genshin/api/spiralAbyss",
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

function getInfo(name) {
  const infoDir = path.resolve(rootdir, "resources", "Version2", "info", "docs");

  return new Promise((resolve, reject) => {
    try {
      const file = path.resolve(infoDir, `${name}.json`);
      resolve(JSON.parse(fs.readFileSync(file)));
    } catch (e) {
      reject(e);
    }
  });
}

function getAbyDetail(role_id, schedule_type, server, cookie) {
  const query = { role_id, schedule_type, server };

  return fetch(`${__API.FETCH_ABY_DETAIL}?${new URLSearchParams(query)}`, {
    method: "GET",
    headers: { ...HEADERS, DS: getDS(query), Cookie: cookie },
  }).then((res) => res.json());
}

function getBase(uid, cookie) {
  const query = { uid };

  return fetch(`${__API.FETCH_ROLE_ID}?${new URLSearchParams(query)}`, {
    method: "GET",
    headers: { ...HEADERS, DS: getDS(query), Cookie: cookie },
  }).then((res) => res.json());
}

function getDetail(role_id, server, cookie) {
  const query = { role_id, server };

  return fetch(`${__API.FETCH_ROLE_INDEX}?${new URLSearchParams(query)}`, {
    method: "GET",
    qs: query,
    headers: { ...HEADERS, DS: getDS(query), Cookie: cookie },
  }).then((res) => res.json());
}

function getCharacters(role_id, server, character_ids, cookie) {
  const body = { character_ids, role_id, server };

  return fetch(__API.FETCH_ROLE_CHARACTERS, {
    method: "POST",
    json: true,
    body: JSON.stringify(body),
    headers: {
      ...HEADERS,
      DS: getDS(undefined, JSON.stringify(body)),
      Cookie: cookie,
      "content-type": "application/json",
    },
  }).then((res) => res.json());
}

function getGachaList() {
  return fetch(__API.FETCH_GACHA_LIST, {
    method: "GET",
  }).then((res) => res.json());
}

function getGachaDetail(gachaID) {
  return fetch(__API.FETCH_GACHA_DETAIL.replace("$", gachaID), {
    method: "GET",
  }).then((res) => res.json());
}

export { getAbyDetail, getBase, getCharacters, getDetail, getGachaDetail, getGachaList, getInfo };
