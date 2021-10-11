import md5 from "md5";
import { randomString } from "./tools.js";

function getQueryParam(data) {
  let arr = [];

  if (undefined === data) {
    return "";
  }

  for (const key of Object.keys(data)) {
    arr.push(`${key}=${data[key]}`);
  }

  return arr.join("&");
}

function getDS(query, body = "") {
  const n = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs";
  const i = (Date.now() / 1000) | 0;
  const r = randomString(6);
  const q = getQueryParam(query);
  const c = md5(`salt=${n}&t=${i}&r=${r}&b=${body}&q=${q}`);
  return `${i},${r},${c}`;
}

export { getDS };
