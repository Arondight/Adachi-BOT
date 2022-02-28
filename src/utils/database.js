import fs from "fs";
import lodash from "lodash";
import { LowSync, MemorySync } from "lowdb";
import path from "path";
import { merge } from "#utils/merge";

const db = {};

function mkpath(...path) {
  if (path.length < 1) {
    throw `Empty path`;
  }

  let result = path[0];

  for (let i = 1; i < path.length; ++i) {
    const item = path[i];

    if (undefined !== item && null !== item) {
      let itemText = item.toString();

      if ("number" === typeof item) {
        itemText = `[${itemText}]`;
      } else if ("[" !== itemText[0]) {
        result += ".";
      }

      result += itemText;
    }
  }

  return result;
}

// 处理不同的调用形式。
// 形式一：db.set(name, key, data);
// 形式二：db.set(name, key, path, data);
function parsed(key, ...data) {
  const simple = 1 === data.length;
  const path = "string" === typeof data[0] ? mkpath(key, data[0]) : key;
  const value = data[true === simple ? 0 : 1];

  return [path, value];
}

function names() {
  return Object.keys(db) || [];
}

function file(dbName) {
  return path.resolve(global.rootdir, "data", "db", `${dbName}.json`);
}

function saved(dbName) {
  let data;

  try {
    data = JSON.parse(fs.readFileSync(file(dbName)));
  } catch (e) {
    // Do nothing
  }

  return data;
}

// 如果数据库不存在，将自动创建新的空数据库。
function init(dbName, struct = { user: [] }) {
  db[dbName] = new LowSync(new MemorySync());
  db[dbName].read();
  db[dbName].data = saved(dbName) || {};
  Object.keys(struct).forEach((c) => {
    if (undefined === db[dbName].data[c]) {
      Object.assign(db[dbName].data, { [c]: struct[c] });
    }
  });
  db[dbName].chain = lodash.chain(db[dbName].data);

  return true;
}

function sync(dbName) {
  if (db[dbName]) {
    fs.writeFileSync(file(dbName), JSON.stringify(db[dbName].data, null, 2));
    return true;
  }

  return false;
}

function has(dbName, key, ...data) {
  if (undefined === db[dbName]) {
    return false;
  }

  let path;

  if (data.length > 0) {
    const more = data.length > 1;
    path = true === more ? mkpath(key, ...data) : mkpath(key, data[0]);
  } else {
    path = key;
  }

  const result = db[dbName].chain.hasIn(path).value();

  return result ? true : false;
}

function includes(dbName, key, ...data) {
  if (undefined === db[dbName]) {
    return false;
  }

  const simple = !(null !== data[0] && ("object" === typeof data[0] || "object" === typeof data[1]));
  const obj = db[dbName].chain.get(key).value();

  if (true === simple) {
    const [path, predicate] = data;

    for (const o of Array.isArray(obj) ? obj : [obj]) {
      if (predicate === lodash.chain(o).get(path).value()) {
        return true;
      }
    }
  } else {
    let path = key;
    let predicate = data[0];

    if (data.length > 1) {
      path = mkpath(key, data[0]);
      predicate = data[1];
    }

    if (true === db[dbName].chain.get(path).some(predicate).value()) {
      return true;
    }
  }

  return false;
}

function remove(dbName, key, ...data) {
  if (undefined === db[dbName]) {
    return false;
  }

  const [path, predicate] = parsed(key, ...data);
  const obj = db[dbName].chain.get(path).value();
  let value;

  if (!obj) {
    return false;
  } else if (Array.isArray(obj)) {
    value = lodash.reject(obj, predicate);
  } else {
    value = obj;

    for (const [k, v] of Object.entries(obj)) {
      if (predicate[k] === v) {
        value = {};
        break;
      }
    }
  }

  if (!Array.isArray(value) && lodash.isEmpty(value)) {
    const list = path.split(".");

    if (list.length > 1) {
      const pathNew = list.slice(0, -1);
      const obj = db[dbName].chain.get(pathNew).value();
      const last = list[list.length - 1];

      if (last.endsWith("]")) {
        const number = parseInt(last);

        if (!Array.isArray(obj)) {
          return false;
        }

        obj.splice(number, 1);
      } else {
        const key = list.slice(-1)[0];

        delete obj[key];
      }
    }
  } else {
    db[dbName].chain.set(path, value).value();
  }

  return true;
}

function get(dbName, key, ...data) {
  if (undefined === db[dbName]) {
    return;
  }

  const [path, predicate] = parsed(key, ...data);
  const whole = 0 === data.length || (1 === data.length && "string" === typeof data[0]);
  let result;

  if (true === whole) {
    result = db[dbName].chain.get(path).value();
  } else {
    const obj = db[dbName].chain.get(path).value();

    if (!obj) {
      result = undefined;
    } else if (!Array.isArray(obj)) {
      if (lodash.some(obj, predicate)) {
        result = obj;
      } else {
        result = undefined;
      }
    } else {
      result = merge(...lodash.chain(obj).filter(predicate).reverse().value());
    }
  }

  return true === lodash.isEmpty(result) ? undefined : result;
}

function set(dbName, key, ...data) {
  if (undefined === db[dbName]) {
    return false;
  }

  const [path, value] = parsed(key, ...data);

  db[dbName].chain.set(path, value).value();

  return true;
}

function push(dbName, key, ...data) {
  if (undefined === db[dbName]) {
    return false;
  }

  const [path, value] = parsed(key, ...data);
  const obj = db[dbName].chain.get(path).value();

  if (Array.isArray(obj)) {
    obj.push(value);
    return true;
  }

  return false;
}

function update(dbName, key, ...data) {
  if (undefined === db[dbName]) {
    return false;
  }

  const simple = 2 === data.length;
  const path = "string" === typeof data[0] ? mkpath(key, data[0]) : key;
  const index = data[true === simple ? 0 : 1];
  const value = data[true === simple ? 1 : 2];
  const dataOld = get(dbName, path, index);
  let dataNew;

  if (undefined === dataOld) {
    dataNew = value;
  } else {
    dataNew = merge(dataOld, value);
  }

  if (true === remove(dbName, path, index)) {
    return push(dbName, path, dataNew);
  }

  return false;
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

export default { clean, file, names, get, has, includes, init, push, remove, set, sync, update };
