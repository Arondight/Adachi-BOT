import fetch from "node-fetch";
import md5 from "md5";
import { randomString } from "./tools.js";

function getQueryParam(data) {
  let arr = [];

  if (undefined === data) {
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

export { getDS };
