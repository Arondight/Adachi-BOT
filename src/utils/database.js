import path from "path";
import lodash from "lodash";
import { JSONFileSync, LowSync } from "lowdb";
import { merge } from "./merge.js";

const db = {};

// 如果数据库不存在，将自动创建新的空数据库。
function init(dbName, defaultElement = { user: [] }) {
  const file = path.resolve(global.rootdir, "data", "db", `${dbName}.json`);
  const adapter = new JSONFileSync(file);

  db[dbName] = new LowSync(adapter);
  db[dbName].read();
  db[dbName].data = db[dbName].data || {};
  Object.keys(defaultElement).forEach(
    (c) => undefined === db[dbName].data[c] && Object.assign(db[dbName].data, { [c]: defaultElement[c] })
  );
  db[dbName].chain = lodash.chain(db[dbName].data);
  db[dbName].write();
}

function has(dbName, ...path) {
  if (undefined === db[dbName]) {
    return false;
  }

  const result = db[dbName].chain.hasIn(path).value() ? true : false;
  return result;
}

function write(dbName) {
  if (db[dbName]) {
    db[dbName].write();
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
  write(dbName);
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
  write(dbName);
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
  write(dbName);
}

function set(dbName, key, data) {
  if (undefined === db[dbName]) {
    return;
  }

  db[dbName].chain.set(key, data).value();
  write(dbName);
}

function cleanByTimeDB(dbName, dbKey = ["user", "uid"], timeRecord = "uid", milliseconds = 60 * 60 * 1000) {
  let nums = 0;

  if (!has(dbName, dbKey[0])) {
    return nums;
  }

  const timeDBRecords = get("time", "user");
  let records = get(dbName, dbKey[0]);

  if (!records) {
    return nums;
  }

  // 无效的 time 数据库，则清空对应数据库的指定字段
  if (!timeDBRecords || !timeDBRecords.length) {
    nums = records.length;
    set(dbName, dbKey[0], []);
    set("time", "user", []);
    return nums;
  }

  for (const i in records) {
    const uid = records[i][dbKey[1]];

    // 没有基准字段则删除该记录（因为很可能是错误数据）
    if (!uid || !has(dbName, dbKey[0], i, dbKey[1])) {
      records.splice(i, 1);
      nums++;
      continue;
    }

    // 没有对应 uid 的时间戳或者时间到现在已超过 milliseconds 则删除该记录
    const timePair = get("time", "user", { [timeRecord]: uid });
    const time = timePair ? timePair.time : undefined;
    const now = new Date().valueOf();

    if (!time || now - time > milliseconds) {
      records.splice(i, 1);
      nums++;
    }
  }

  write(dbName);
  return nums;
}

// 清理不是今天的数据
function cleanCookies() {
  const dbName = "cookies";
  const keys = ["cookie", "uid"];
  const today = new Date().toLocaleDateString();
  let nums = 0;

  for (const key of keys) {
    let records = get(dbName, key);

    for (const i in records) {
      // 1. 没有基准字段则删除该记录
      // 2. 不是今天的记录一律删除
      if (!records[i].date || today != records[i].date) {
        records.splice(i, 1);
        nums++;
      }
    }
  }

  write(dbName);
  return nums;
}

// 清理不在配置文件的数据
function cleanCookiesInvalid() {
  const dbName = "cookies_invalid";
  const cookies = get(dbName, "cookie") || [];
  let nums = 0;

  for (const i in cookies) {
    if (!cookies[i].cookie || !(global.cookies || []).includes(cookies[i].cookie)) {
      cookies.splice(i, 1);
      nums++;
    }
  }

  write(dbName);
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

export default { init, has, write, includes, remove, get, push, update, set, clean };
