import FileSync from "lowdb/adapters/FileSync.js";
import lowdb from "lowdb";
import url from "url";
import path from "path";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = [];

function newDB(name, defaultElement = { user: [] }) {
  db[name] = lowdb(
    new FileSync(
      path.resolve(__dirname, "..", "..", "data", "db", name + ".json")
    )
  );
  db[name].defaults(defaultElement).write();
}

async function isInside(name, key, index, value) {
  return db[name].get(key).map(index).value().includes(value);
}

async function get(name, key, index) {
  return db[name].get(key).find(index).value();
}

async function update(name, key, index, data) {
  db[name].get(key).find(index).assign(data).write();
}

async function push(name, key, data) {
  db[name].get(key).push(data).write();
}

async function set(name, key, data) {
  db[name].set(key, data).write();
}

async function getID(msg, userID) {
  let id = msg.match(/\d{9}/g);
  let errInfo = "";

  if (msg.includes("CQ:at")) {
    let atID = parseInt(id[0]);

    if (await isInside("map", "user", "userID", atID)) {
      return (await get("map", "user", { userID: atID })).mhyID;
    } else {
      errInfo = "用户 " + atID + " 暂未绑定米游社通行证。";
    }
  } else if (id !== null) {
    if (id.length > 1) {
      errInfo = "输入通行证不合法。";
    } else {
      return parseInt(id[0]);
    }
  } else if (await isInside("map", "user", "userID", userID)) {
    return (await get("map", "user", { userID })).mhyID;
  } else {
    errInfo =
      "您还未绑定米游社通行证，请使用 【绑定 你的米游社通行证ID（非UID）】来关联米游社通行证。";
  }

  return errInfo;
}

export { newDB, isInside, get, update, push, set, getID };
