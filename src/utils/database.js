import { Low, JSONFileSync } from "lowdb";
import url from "url";
import path from "path";
import lodash from "lodash";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = {};

async function newDB(name, defaultElement = { user: [] }) {
  const file = path.resolve(
    __dirname,
    "..",
    "..",
    "data",
    "db",
    `${name}.json`
  );
  const adapter = new JSONFileSync(file);

  db[name] = new Low(adapter);
  await db[name].read();
  db[name].data = db[name].data || defaultElement;
  db[name].chain = lodash.chain(db[name].data);
  db[name].write();
}

async function isInside(name, key, index, value) {
  return db[name].chain.get(key).map(index).includes(value).value();
}

async function get(name, key, index) {
  return db[name].chain.get(key).find(index).value();
}

async function update(name, key, index, data) {
  db[name].chain.get(key).find(index).assign(data).value();
  db[name].write();
}

async function push(name, key, data) {
  db[name].chain.get(key).push(data).value();
  db[name].write();
}

async function set(name, key, data) {
  db[name].chain.set(key, data).value();
  db[name].write();
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

// TODO 规整一下，这个函数实在太复杂了，作为作者的我都用起来犯迷糊……
//
// 根据 QQ 号码查询米游社 ID，或者，判断包含 ID 的字符串是否为合法 ID 并返回。
// 这个函数参数和返回值较复杂，使用时务必阅读下面的注释，并合理地传参和验证返回。
//
//
// 参数：
//
//  1. msg     =>
//      一条 QQ 聊天记录，可能包含一个 ID
//  2. userID  =>
//      isMhyID == true      -> QQ 号码
//      isMhyID == false     -> 任意值（不会使用）
//  3. isMhyID =>
//      true                 -> 返回米游社 ID
//      false                -> 验证并返回 UID
//
//
// 返回：
//
//  1. 成功    =>
//      isMhyID == true      -> Number
//      isMhyID == false     -> [Number, String]
//  2. 失败    =>
//      1. msg 包含 CQ 码 =>
//          isMhyID == true  -> String，或者，null
//          isMhyID == false -> null
//      2. msg 有 ID      =>
//          isMhyID == true  -> String
//          isMhyID == false -> String
//      3. msg 无 ID      =>
//          isMhyID == true  -> null
//          isMhyID == false -> null
//      4. 其他情况       =>
//          String
async function getID(msg, userID, isMhyID = true) {
  let msgstr = msg.toString();
  let idInMsg = msgstr.match(/\d+/g);
  let id = idInMsg ? parseInt(idInMsg[0]) : null;
  let idstr = id ? id.toString() : null;
  let cqmsg = msgstr.includes("CQ:at") ? true : false;
  let errInfo = "";

  if (isMhyID && !userID) {
    errInfo = "无法在查询米游社通行证时不指定 QQ（isMhyID && !userID）。";
    return errInfo;
  }

  if (cqmsg) {
    // 字符串中包含 CQ 码
    if (isMhyID) {
      if (await isInside("map", "user", "userID", id)) {
        return (await get("map", "user", { userID: id })).mhyID;
      }

      errInfo = `用户 [CQ:at,qq=${id}] 暂未绑定米游社通行证。`;
      return errInfo;
    }

    return null; // 返回 null，无法验证一个 QQ 号码是否为合法 UID
  } else if (id !== null) {
    // 字符串中有 ID，处理第一个
    if (isMhyID) {
      if (idstr && !(idstr.length == 7 || idstr.length == 8)) {
        errInfo = "米游社通行证 ID 不合法。";
        return errInfo;
      }

      return id;
    }

    return getUID(id);
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
