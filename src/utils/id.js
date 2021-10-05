import db from "./database.js";

function getUID(msg) {
  let errInfo = "输入 UID 不合法，需要一个在天空岛或世界树服务器上的真实 UID。";
  let id = parseInt(msg);
  let idstr = id ? id.toString() : undefined;

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
//      isMhyID is true      -> QQ 号码
//      isMhyID is false     -> 任意值（不会使用）
//  3. isMhyID =>
//      true                 -> 返回米游社 ID
//      false                -> 验证并返回 UID
//
//
// 返回：
//
//  1. 成功    =>
//      isMhyID is true      -> Number
//      isMhyID is false     -> [Number, String]
//  2. 失败    =>
//      1. msg 包含 CQ 码 =>
//          isMhyID is true  -> String 或者 undefined
//          isMhyID is false -> undefined
//      2. msg 有 ID      =>
//          isMhyID is true  -> String
//          isMhyID is false -> String
//      3. msg 无 ID      =>
//          isMhyID is true  -> undefined
//          isMhyID is false -> undefined
//      4. 其他情况       =>
//          String
async function getID(msg, userID, isMhyID = true) {
  let msgstr = msg.toString();
  let idInMsg = msgstr.match(/\d+/g);
  let id = idInMsg ? parseInt(idInMsg[0]) : undefined;
  let idstr = id ? id.toString() : undefined;
  let cqmsg = msgstr.includes("CQ:at") ? true : false;
  let errInfo = "";

  if (isMhyID && !userID) {
    errInfo = "无法在查询米游社通行证时不指定 QQ（isMhyID && !userID）。";
    return errInfo;
  }

  if (cqmsg) {
    // 字符串中包含 CQ 码
    if (isMhyID) {
      if (await db.includes("map", "user", "userID", id)) {
        return (await db.get("map", "user", { userID: id })).mhyID;
      }

      errInfo = "暂未绑定米游社通行证。";
      return errInfo;
    }

    return undefined; // 返回 undefined ，无法验证一个 QQ 号码是否为合法 UID
  } else if (
    id !== undefined &&
    idstr &&
    idstr.length >= 6 &&
    idstr.length < 10
  ) {
    // 字符串中的 ID 大致合法
    return isMhyID ? id : getUID(id);
  } else if (await db.includes("map", "user", "userID", userID)) {
    // 字符串中无看似合法的 ID
    if (isMhyID) {
      return (await db.get("map", "user", { userID })).mhyID; // 返回米游社 ID 或者 undefined
    }

    return undefined; // 返回 undefined ，无法验证一个空的 UID
  }

  errInfo = `您还未绑定米游社通行证，请使用 【${command.functions.entrance.save[0]} 您的米游社通行证ID（非UID）】来关联米游社通行证。`;

  return errInfo;
}

export { getUID, getID };
