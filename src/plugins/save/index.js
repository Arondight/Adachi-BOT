/* global command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { hasEntrance } from "../../utils/config.js";
import { getID } from "../../utils/id.js";

async function setCacheTimeout(userID, mhyID, bot) {
  if (await db.includes("map", "user", "userID", userID)) {
    const { UID: uid } = (await db.get("map", "user", { userID })) || {};
    const reason = "因米游社 ID 变更而强制超时";

    if (uid) {
      await db.update("time", "user", { aby: uid }, { time: 0 });
      bot.logger.debug(`缓存：用户 ${userID} 的深渊数据${reason}。`);
      await db.update("time", "user", { uid }, { time: 0 });
      bot.logger.debug(`缓存：用户 ${userID} 的玩家数据${reason}。`);
    }
  }
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const sendID = "group" === type ? groupID : userID;
  const id = await getID(msg, userID); // 米游社 ID，这里正则限定了 msg 必然有 ID
  const mhyID = id;
  const cardCmd = command.functions.name.card;
  const saveCmd = command.functions.name.save;
  const changeCmd = command.functions.name.change;
  const okMsg = `使用【${cardCmd}】来查询游戏信息并更新您的游戏角色。`;
  const existMsg = `您已绑定通行证，使用【${changeCmd} ${mhyID}】。`;
  const unexistMsg = `您还未绑定通行证，使用【${saveCmd} ${mhyID}】。`;

  if ("string" === typeof id) {
    await bot.sendMessage(sendID, id, type, userID);
    return;
  }

  if (hasEntrance(msg, "save", "save")) {
    if (!(await db.includes("map", "user", "userID", userID))) {
      await db.push("map", "user", { userID, mhyID });
      await bot.sendMessage(sendID, `通行证绑定成功，${okMsg}`, type, userID);
      await setCacheTimeout(userID, mhyID, bot);
    } else {
      await bot.sendMessage(sendID, existMsg, type, userID);
    }
  } else if (hasEntrance(msg, "save", "change")) {
    if (await db.includes("map", "user", "userID", userID)) {
      await db.update("map", "user", { userID }, { mhyID });
      await bot.sendMessage(sendID, `通行证改绑成功，${okMsg}`, type, userID);
      await setCacheTimeout(userID, mhyID, bot);
    } else {
      await bot.sendMessage(sendID, unexistMsg, type, userID);
    }
  }
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
