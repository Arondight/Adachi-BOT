/* global alias, command, config */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { getID, getUID } from "../../utils/id.js";
import {
  basePromise,
  detailPromise,
  characterPromise,
} from "../../utils/detail.js";

async function getCharacter(uid, character) {
  const { avatars } = (await db.get("info", "user", { uid })) || {};
  return avatars ? avatars.find((e) => e.name === character) : false;
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const isMyChar = hasEntrance(msg, "character", "character");
  let text = msg;
  let uid;
  let data;

  if (text.match(/^\[CQ:at,qq=\d+,text=.+?\]/)) {
    text = text.replace(/\[CQ:at,qq=\d+,text=.+?\]\s*/, "");
  }

  const textParts = text.split(/\s+/);
  let character = textParts[1];

  if (text.match(/^\d+\s+/)) {
    character = textParts[2];
  }

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type, bot);
    return;
  }

  if (!character) {
    await bot.sendMessage(sendID, "请正确输入角色名称。", type, userID);
    return;
  }

  character =
    alias[
      "string" === typeof character ? character.toLowerCase() : character
    ] || character;

  try {
    let dbInfo = isMyChar ? await getID(msg, userID) : await getUID(msg);
    let baseInfo;

    if (!isMyChar && (!dbInfo || "string" === typeof dbInfo)) {
      dbInfo = await getID(msg, userID); // 米游社 ID
    }

    if ("string" === typeof dbInfo) {
      await bot.sendMessage(sendID, dbInfo, type, userID);
      return;
    }

    if (Array.isArray(dbInfo)) {
      baseInfo = dbInfo;
      uid = baseInfo[0];
    } else {
      baseInfo = await basePromise(dbInfo, userID, bot);
      uid = baseInfo[0];
    }

    data = await getCharacter(uid, character);

    if (!data) {
      if (!config.characterTryGetDetail) {
        const cmd = [
          command.functions.entrance.card[0],
          command.functions.entrance.package[0],
        ];
        const cmdStr = `【${cmd.join("】、【")}】`;

        await bot.sendMessage(
          sendID,
          `查询失败，如果${
            isMyChar ? "您" : "他"
          }拥有该角色，使用${cmdStr}更新游戏角色后再次查询。`,
          type,
          userID
        );
        return;
      } else {
        const detailInfo = await detailPromise(...baseInfo, userID, bot);
        await characterPromise(...baseInfo, detailInfo, bot);
        data = await getCharacter(uid, character);
      }
    }
  } catch (e) {
    if (true === e.detail) {
      // 尝试使用缓存
      if (true !== e.cache) {
        if ("string" === typeof e.message) {
          await bot.sendMessage(sendID, e.message, type, userID);
        }
        if (true === e.master && "string" === typeof e.message_master) {
          await bot.sendMaster(sendID, e.message_master, type, userID);
        }
        return;
      }
    } else {
      await bot.sendMessage(sendID, e, type, userID);
      return;
    }
  }

  if (!data) {
    await bot.sendMessage(
      sendID,
      `看上去${isMyChar ? "您" : "他"}尚未拥有该角色。`,
      type,
      userID
    );
    return;
  }

  await render({ uid, data }, "genshin-character", sendID, type, userID, bot);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
