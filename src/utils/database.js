const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const db = [];

const newDB = (name, defaultElement = { user: [] }) => {
  db[name] = low(
    new FileSync(
      path.resolve(__dirname, "..", "..", "data", "db", name + ".json")
    )
  );
  db[name].defaults(defaultElement).write();
};

const isInside = async (name, key, index, value) => {
  return db[name].get(key).map(index).value().includes(value);
};

const get = async (name, key, index) => {
  return db[name].get(key).find(index).value();
};

const update = async (name, key, index, data) => {
  db[name].get(key).find(index).assign(data).write();
};

const push = async (name, key, data) => {
  db[name].get(key).push(data).write();
};

const set = async (name, key, data) => {
  db[name].set(key, data).write();
};

const getID = async (msg, userID) => {
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
};

module.exports = {
  newDB,
  isInside,
  get,
  update,
  push,
  set,
  getID,
};
