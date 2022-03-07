import db from "#utils/database";
import { getID } from "#utils/id";

function setCacheTimeout(uid, mhyID, bot) {
  if (db.includes("map", "user", { userID: uid })) {
    const { UID: id } = db.get("map", "user", { userID: uid }) || {};
    const reason = "因米游社 ID 变更而强制超时";

    if (id) {
      db.update("time", "user", { aby: id }, { time: 0 });
      bot.logger.debug(`缓存：用户 ${id} 的深渊数据${reason}。`);
      db.update("time", "user", { uid: id }, { time: 0 });
      bot.logger.debug(`缓存：用户 ${id} 的玩家数据${reason}。`);
    }
  }
}

function doSave(msg) {
  const id = msg.text.match(/\d+/);
  const mhyID = getID(msg.text, msg.uid); // 米游社 ID
  const cardCmd = global.command.functions.name.card;
  const okMsg = `使用【${cardCmd}】来查询游戏信息并更新您的游戏角色。`;

  if (null === id) {
    if (db.includes("map", "user", { userID: msg.uid })) {
      db.update("map", "user", { userID: msg.uid }, { mhyID: undefined });
    }

    msg.bot.say(msg.sid, `米游社通行证已经解绑。`, msg.type, msg.uid, true);
    return;
  }

  if ("string" === typeof mhyID) {
    msg.bot.say(msg.sid, mhyID, msg.type, msg.uid, true);
    return;
  }

  if (db.includes("map", "user", { userID: msg.uid })) {
    db.update("map", "user", { userID: msg.uid }, { mhyID });
  } else {
    db.push("map", "user", { userID: msg.uid, mhyID });
  }

  msg.bot.say(msg.sid, `米游社通行证绑定成功，${okMsg}`, msg.type, msg.uid, true);
  setCacheTimeout(msg.uid, mhyID, msg.bot);
}

export { doSave };
