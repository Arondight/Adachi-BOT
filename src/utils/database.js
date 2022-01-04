import fs from "fs";
import path from "path";
import lodash from "lodash";
import { LowSync, MemorySync } from "lowdb";
import { merge } from "./merge.js";

const db = {};

function names() {
  return Object.keys(db) || [];
}

function dbFile(dbName) {
  return path.resolve(global.rootdir, "data", "db", `${dbName}.json`);
}

function saved(dbName) {
  let data;

  try {
    data = JSON.parse(fs.readFileSync(dbFile(dbName)));
  } catch (e) {
    // Do nothing
  }

  return data;
}

// 如果数据库不存在，将自动创建新的空数据库。
function init(dbName, defaultElement = { user: [] }) {
  db[dbName] = new LowSync(new MemorySync());
  db[dbName].read();
  db[dbName].data = saved(dbName) || {};
  Object.keys(defaultElement).forEach(
    (c) => undefined === db[dbName].data[c] && Object.assign(db[dbName].data, { [c]: defaultElement[c] })
  );
  db[dbName].chain = lodash.chain(db[dbName].data);
}

function has(dbName, ...path) {
  if (undefined === db[dbName]) {
    return false;
  }

  const result = db[dbName].chain.hasIn(path).value() ? true : false;
  return result;
}

function sync(dbName) {
  if (db[dbName]) {
    fs.writeFileSync(dbFile(dbName), JSON.stringify(db[dbName].data, null, 2));
  }
}

function includes(dbName, key, index, value) {
  if (undefined === db[dbName]) {
    return false;
  }

  const result = db[dbName].chain.get(key).map(index).includes(value).value() ? true : false;
  return result;
}

function remove(dbName, key, index) {
  if (undefined === db[dbName]) {
    return;
  }

  db[dbName].data[key] = db[dbName].chain.get(key).reject(index).value();
}

function get(dbName, key, index = undefined) {
  if (undefined === db[dbName]) {
    return undefined;
  }

  const result =
    undefined === index
      ? db[dbName].chain.get(key).value()
      : merge(...db[dbName].chain.get(key).filter(index).reverse().value());
  return result && (lodash.isEmpty(result) ? undefined : result);
}

function push(dbName, key, data) {
  if (undefined === db[dbName]) {
    return;
  }

  db[dbName].data[key].push(data);
}

function update(dbName, key, index, data) {
  if (undefined === db[dbName]) {
    return;
  }

  const old = get(dbName, key, index);

  if (undefined !== old) {
    remove(dbName, key, index);
    data = merge(old, data);
  }

  push(dbName, key, data);
}

function set(dbName, key, data) {
  if (undefined === db[dbName]) {
    return;
  }

  db[dbName].chain.set(key, data).value();
}

function cleanByTimeDB(dbName, dbKey = ["user", "uid"], timeRecord = "uid", milliseconds = 60 * 60 * 1000) {
  let nums = 0;

  if (!has(dbName, dbKey[0])) {
    return nums;
  }

  const timeDBRecords = get("time", "user");
  const records = get(dbName, dbKey[0]);

  if (undefined === records || !Array.isArray(records)) {
    return nums;
  }

  // 无效的 time 数据库，则清空对应数据库的指定字段
  if (!timeDBRecords || !timeDBRecords.length) {
    nums = records.length;
    set(dbName, dbKey[0], []);
    set("time", "user", []);
    return nums;
  }

  for (let i = 0, len = records.length; i < len; ++i) {
    const uid = records[i][dbKey[1]];

    // 没有基准字段则删除该记录（因为很可能是错误数据）
    if (!uid || !has(dbName, dbKey[0], i, dbKey[1])) {
      records.splice(i, 1);
      --i;
      --len;
      ++nums;
      continue;
    }

    // 没有对应 uid 的时间戳或者时间到现在已超过 milliseconds 则删除该记录
    const timePair = get("time", "user", { [timeRecord]: uid });
    const time = timePair ? timePair.time : undefined;
    const now = new Date().valueOf();

    if (!time || now - time > milliseconds) {
      records.splice(i, 1);
      --i;
      --len;
      ++nums;
    }
  }

  return nums;
}

// 清理不是今天的数据
function cleanCookies() {
  const dbName = "cookies";
  const keys = ["cookie", "uid"];
  const today = new Date().toLocaleDateString();
  let nums = 0;

  for (const key of keys) {
    const records = get(dbName, key);

    if (undefined === records || !Array.isArray(records)) {
      continue;
    }

    for (let i = 0, len = records.length; i < len; ++i) {
      // 1. 没有基准字段则删除该记录
      // 2. 不是今天的记录一律删除
      if (!records[i].date || today !== records[i].date) {
        records.splice(i, 1);
        --i;
        --len;
        ++nums;
      }
    }
  }

  return nums;
}

// 清理不在配置文件的数据
function cleanCookiesInvalid() {
  const dbName = "cookies_invalid";
  const records = get(dbName, "cookie") || [];
  let nums = 0;

  if (undefined === records || !Array.isArray(records)) {
    return nums;
  }

  for (let i = 0, len = records.length; i < len; ++i) {
    if (!records[i].cookie || !global.cookies.includes(records[i].cookie)) {
      records.splice(i, 1);
      --i;
      --len;
      ++nums;
    }
  }

  return nums;
}

function clean(dbName) {
  switch (dbName) {
    case "aby":
      return cleanByTimeDB(dbName, ["user", "uid"], "aby", global.config.dbAbyEffectTime * 60 * 60 * 1000);
    case "info":
      return cleanByTimeDB(dbName, ["user", "uid"], "uid", global.config.dbInfoEffectTime * 60 * 60 * 1000);
    case "cookies":
      return cleanCookies();
    case "cookies_invalid":
      return cleanCookiesInvalid();
  }

  return 0;
}

export default { clean, names, get, has, includes, init, push, remove, set, sync, update };
