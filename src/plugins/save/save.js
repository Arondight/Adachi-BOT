/* global command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { getID } from "../../utils/id.js";

async function setCacheTimeout(uid, mhyID, bot) {
  if (await db.includes("map", "user", "uid", uid)) {
    const { UID: id } = (await db.get("map", "user", { userID: uid })) || {};
    const reason = "因米游社 ID 变更而强制超时";

    if (id) {
      await db.update("time", "user", { aby: id }, { time: 0 });
      bot.logger.debug(`缓存：用户 ${id} 的深渊数据${reason}。`);
      await db.update("time", "user", { uid: id }, { time: 0 });
      bot.logger.debug(`缓存：用户 ${id} 的玩家数据${reason}。`);
    }
  }
}

async function doSave(msg, action = "save") {
  const id = await getID(msg.text, msg.uid); // 米游社 ID，这里正则限定了 msg 必然有 ID
  const mhyID = id;
  const cardCmd = command.functions.name.card;
  const saveCmd = command.functions.name.save;
  const changeCmd = command.functions.name.change;
  const okMsg = `使用【${cardCmd}】来查询游戏信息并更新您的游戏角色。`;
  const existMsg = `您已绑定通行证，使用【${changeCmd} ${mhyID}】。`;
  const unexistMsg = `您还未绑定通行证，使用【${saveCmd} ${mhyID}】。`;

  if ("string" === typeof id) {
    await msg.bot.say(msg.sid, id, msg.type, msg.uid);
    return;
  }

  switch (action) {
    case "save":
      if (!(await db.includes("map", "user", "userID", msg.uid))) {
        await db.push("map", "user", { userID: msg.uid, mhyID });
        await msg.bot.say(msg.sid, `通行证绑定成功，${okMsg}`, msg.type, msg.uid);
        await setCacheTimeout(msg.uid, mhyID, msg.bot);
      } else {
        await msg.bot.say(msg.sid, existMsg, msg.type, msg.uid);
      }
      break;
    case "change":
      if (await db.includes("map", "user", "userID", msg.uid)) {
        await db.update("map", "user", { userID: msg.uid }, { mhyID });
        await msg.bot.say(msg.sid, `通行证改绑成功，${okMsg}`, msg.type, msg.uid);
        await setCacheTimeout(msg.uid, mhyID, msg.bot);
      } else {
        await msg.bot.say(msg.sid, unexistMsg, msg.type, msg.uid);
      }
      break;
  }
}

export { doSave };
