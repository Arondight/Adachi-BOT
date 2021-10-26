/* global config, rootdir */
/* eslint no-undef: "error" */

import { Low, JSONFileSync } from "lowdb";
import path from "path";
import lodash from "lodash";
import { Mutex } from "async-mutex";

const db = {};
let mutexMemoryForDB = {};
let mutexFileForDB = {};

// 如果数据库不存在，将自动创建新的空数据库。
async function init(dbName, defaultElement = { user: [] }) {
  const file = path.resolve(rootdir, "data", "db", `${dbName}.json`);
  const adapter = new JSONFileSync(file);

  db[dbName] = new Low(adapter);
  await db[dbName].read();
  db[dbName].data = db[dbName].data || defaultElement;
  db[dbName].chain = await lodash.chain(db[dbName].data);

  mutexFileForDB[dbName] = new Mutex();
  mutexMemoryForDB[dbName] = new Mutex();

  const release = await mutexFileForDB[dbName].acquire();
  await db[dbName].write();
  release();
}

async function has(dbName, ...path) {
  if (undefined === db[dbName]) {
    return false;
  }

  const release = await mutexMemoryForDB[dbName].acquire();
  const result = (await db[dbName].chain.hasIn(path).value()) ? true : false;
  release();

  return result;
}

async function write(dbName) {
  if (db[dbName]) {
    const release = await mutexFileForDB[dbName].acquire();
    await db[dbName].write();
    release();
  }
}

async function includes(dbName, key, index, value) {
  if (undefined === db[dbName]) {
    return false;
  }

  const release = await mutexMemoryForDB[dbName].acquire();
  const result = (await db[dbName].chain
    .get(key)
    .map(index)
    .includes(value)
    .value())
    ? true
    : false;
  release();

  return result;
}

async function remove(dbName, key, index) {
  if (undefined === db[dbName]) {
    return;
  }

  const release = await mutexMemoryForDB[dbName].acquire();
  db[dbName].data[key] = await db[dbName].chain.get(key).reject(index).value();
  release();

  await write(dbName);
}

async function get(dbName, key, index = undefined) {
  if (undefined === db[dbName]) {
    return undefined;
  }

  const release = await mutexMemoryForDB[dbName].acquire();
  const result =
    undefined === index
      ? await db[dbName].chain.get(key).value()
      : await db[dbName].chain.get(key).find(index).value();
  release();

  return result;
}

async function push(dbName, key, data) {
  if (undefined === db[dbName]) {
    return;
  }

  const release = await mutexMemoryForDB[dbName].acquire();
  await db[dbName].chain.get(key).push(data).value();
  release();

  await write(dbName);
}

async function update(dbName, key, index, data) {
  if (undefined === db[dbName]) {
    return;
  }

  const release = await mutexMemoryForDB[dbName].acquire();
  await db[dbName].chain.get(key).find(index).assign(data).value();
  release();

  await write(dbName);
}

async function set(dbName, key, data) {
  if (undefined === db[dbName]) {
    return;
  }

  const release = await mutexMemoryForDB[dbName].acquire();
  await db[dbName].chain.set(key, data).value();
  release();

  await write(dbName);
}

async function cleanByTimeDB(
  dbName,
  dbKey = ["user", "uid"],
  timeRecord = "uid",
  milliseconds = 60 * 60 * 1000
) {
  let nums = 0;

  if (!(await has(dbName, dbKey[0]))) {
    return nums;
  }

  const timeDBRecords = await get("time", "user");
  let records = await get(dbName, dbKey[0]);

  if (!records) {
    return nums;
  }

  // 无效的 time 数据库，则清空对应数据库的指定字段
  if (!timeDBRecords || !timeDBRecords.length) {
    nums = records.length;
    await set(dbName, dbKey[0], []);
    await set("time", "user", []);
    return nums;
  }

  for (const i in records) {
    const uid = records[i][dbKey[1]];
    let release;

    // 没有基准字段则删除该记录（因为很可能是错误数据）
    if (!uid || !(await has(dbName, dbKey[0], i, dbKey[1]))) {
      release = await mutexMemoryForDB[dbName].acquire();
      records.splice(i, 1);
      release();
      nums++;
      continue;
    }

    // 没有对应 uid 的时间戳或者时间到现在已超过 milliseconds 则删除该记录
    const timePair = await get("time", "user", { [timeRecord]: uid });
    const time = timePair ? timePair.time : undefined;
    const now = new Date().valueOf();

    if (!time || now - time > milliseconds) {
      release = await mutexMemoryForDB[dbName].acquire();
      records.splice(i, 1);
      release();
      nums++;
    }
  }

  await write(dbName);
  return nums;
}

// 清理不是今天的数据
async function cleanCookies() {
  const dbName = "cookies";
  const keys = ["cookie", "uid"];
  const today = new Date().toLocaleDateString();
  let nums = 0;

  for (const key of keys) {
    let records = await get(dbName, key);
    const release = await mutexMemoryForDB[dbName].acquire();

    for (const i in records) {
      // 1. 没有基准字段则删除该记录
      // 2. 不是今天的记录一律删除
      if (!records[i].date || today != records[i].date) {
        records.splice(i, 1);
        nums++;
      }
    }

    release();
  }

  await write(dbName);
  return nums;
}

// 清理不在配置文件的数据
async function cleanCookiesInvalid() {
  const dbName = "cookies_invalid";
  const cookies = (await get(dbName, "cookie")) || [];
  let nums = 0;
  const release = await mutexMemoryForDB[dbName].acquire();

  for (const i in cookies) {
    if (
      !cookies[i].cookie ||
      !(config.cookies || []).includes(cookies[i].cookie)
    ) {
      cookies.splice(i, 1);
      nums++;
    }
  }

  release();

  await write(dbName);
  return nums;
}

async function clean(dbName) {
  switch (dbName) {
    case "aby":
      return await cleanByTimeDB(
        dbName,
        ["user", "uid"],
        "aby",
        config.dbAbyEffectTime * 60 * 60 * 1000
      );
    case "info":
      return await cleanByTimeDB(
        dbName,
        ["user", "uid"],
        "uid",
        config.dbInfoEffectTime * 60 * 60 * 1000
      );
    case "cookies":
      return await cleanCookies();
    case "cookies_invalid":
      return await cleanCookiesInvalid();
  }

  return 0;
}

export default {
  init,
  has,
  write,
  includes,
  remove,
  get,
  push,
  update,
  set,
  clean,
};
