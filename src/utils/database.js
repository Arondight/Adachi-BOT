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

function getUID(msg) {
  let errInfo = "输入 UID 不合法，需要一个在天空岛或世界树服务器上的真实 UID。";
  let id = parseInt(msg);
  let idstr = id ? id.toString() : null;

  if (
    !idstr ||
    idstr.length !== 9 ||
    (idstr[0] !== "1" && idstr[0] !== "2" && idstr[0] !== "5")
  ) {
    return errInfo;
  }

  let region = idstr[0] === "5" ? "cn_qd01" : "cn_gf01";
  return [id, region];
}

// 根据 QQ 号码查询米游社 ID，或者，判断包含 ID 的字符串是否为合法 ID 并返回。
// 当参数 msg 包含 CQ 码 "CQ:at" 时，总是查询米游社 ID。
//
// 参数：
//  1. msg     =>
//      一条 QQ 聊天记录，可能包含一个 ID
//  2. userID  =>
//      isMhyID = true  -> QQ 号码
//      isMhyID = false -> 任意值（不会使用）
//  3. isMhyID =>
//      true  -> 返回米游社 ID
//      false -> 验证并返回 UID
// 返回：
//  1. 成功    =>
//      isMhyID = true  -> Number
//      isMhyID = false -> [Number, String]
//  2. 失败    =>
//      非空 String 用以描述错误，或者，null
async function getID(msg, userID, isMhyID = true) {
  let msgstr = msg.toString();
  let idInMsg = msgstr.match(/\d+/g);
  let id = idInMsg ? parseInt(idInMsg[0]) : null;
  let idstr = id ? id.toString() : null;
  let errInfo = "";

  if (isMhyID && !userID) {
    errInfo = "无法在查询米游社通行证时不指定 QQ（isMhyID && !userID）。";
    return errInfo;
  }

  // 合法的 ID ：米游社 ID 8 位，UID 9 位
  if (idstr && !(idstr.length == 8 || idstr.length == 9)) {
    errInfo = "ID 不合法。";
    return errInfo;
  }

  if (msgstr.includes("CQ:at")) {
    // 字符串中包含 CQ 码 "CQ:at"
    let atID = id;
    if (await isInside("map", "user", "userID", atID)) {
      return (await get("map", "user", { userID: atID })).mhyID;
    }
    errInfo = "用户 " + atID + " 暂未绑定米游社通行证。";
  } else if (id !== null) {
    // 字符串中有 ID，处理第一个
    return isMhyID ? id : getUID(id);
  } else if (await isInside("map", "user", "userID", userID)) {
    // 字符串中无 ID
    if (isMhyID) {
      return (await get("map", "user", { userID })).mhyID; // 返回米游社 ID，或者，null
    }
    return null; // 返回 null，无法验证一个空的 UID
  }

  errInfo =
    "您还未绑定米游社通行证，请使用 【绑定 你的米游社通行证ID（非UID）】来关联米游社通行证。";

  return errInfo;
}

export { newDB, isInside, get, update, push, set, getID };
