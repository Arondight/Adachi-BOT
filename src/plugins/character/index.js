/* global alias, command, config */
/* eslint no-undef: "error" */

import lodash from "lodash";
import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { getID, getUID } from "../../utils/id.js";
import { guessPossibleNames } from "../../utils/tools.js";
import {
  basePromise,
  detailPromise,
  characterPromise,
  handleDetailError,
} from "../../utils/detail.js";

async function getCharacter(uid, character) {
  const { avatars } = (await db.get("info", "user", { uid })) || {};
  return avatars ? avatars.find((e) => e.name === character) : false;
}

async function getNotFoundText(character, isMyChar) {
  const cmd = [command.functions.name.card, command.functions.name.package];
  const cmdStr = `【${cmd.join("】、【")}】`;
  const text = config.characterTryGetDetail
    ? `看上去${isMyChar ? "您" : "他"}尚未拥有该角色`
    : `如果${
        isMyChar ? "您" : "他"
      }拥有该角色，使用${cmdStr}更新游戏角色后再次查询`;
  const guess = guessPossibleNames(character, alias.characterNames);
  const notFoundText = `查询失败，${text}。${
    guess ? "\n您要查询的是不是：\n" + guess : ""
  }`;

  return notFoundText;
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

  character = "string" === typeof character ? character.toLowerCase() : "";
  character = alias.character[character] || character;

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
        await bot.sendMessage(
          sendID,
          await getNotFoundText(character, isMyChar),
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
    const ret = await handleDetailError(e);

    if (!ret) {
      await bot.sendMaster(sendID, e, type, userID);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && (await bot.sendMessage(sendID, ret[0], type, userID));
      ret[1] && (await bot.sendMaster(sendID, ret[1], type, userID));
      return;
    }
  }

  if (!data) {
    await bot.sendMessage(
      sendID,
      await getNotFoundText(character, isMyChar),
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
