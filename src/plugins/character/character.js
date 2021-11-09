/* global alias, command, config */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { getID, getUID } from "../../utils/id.js";
import { guessPossibleNames } from "../../utils/tools.js";
import { basePromise, detailPromise, characterPromise, handleDetailError } from "../../utils/detail.js";

async function getCharacter(uid, character) {
  const { avatars } = (await db.get("info", "user", { uid })) || {};
  return avatars ? avatars.find((e) => e.name === character) : false;
}

async function getNotFoundText(character, isMyChar) {
  const cmd = [command.functions.name.card, command.functions.name.package];
  const cmdStr = `【${cmd.join("】、【")}】`;
  const text = config.characterTryGetDetail
    ? `看上去${isMyChar ? "您" : "他"}尚未拥有该角色`
    : `如果${isMyChar ? "您" : "他"}拥有该角色，使用${cmdStr}更新游戏角色后再次查询`;
  const guess = guessPossibleNames(character, alias.characterNames);
  const notFoundText = `查询失败，${text}。${guess ? "\n您要查询的是不是：\n" + guess : ""}`;

  return notFoundText;
}

async function getName(text) {
  if (text.match(/^\[CQ:at,qq=\d+,text=.+?\]/)) {
    text = text.replace(/\[CQ:at,qq=\d+,text=.+?\]\s*/, "");
  }

  const textParts = text.split(/\s+/);
  let character = textParts[1];

  if (text.match(/^\d+\s+/)) {
    character = textParts[2];
  }

  if (!character) {
    return undefined;
  }

  character = "string" === typeof character ? character.toLowerCase() : "";
  character = alias.character[character] || character;

  return character;
}

async function doCharacter(msg, isMyChar = true) {
  let uid;
  let data;

  const character = await getName(msg.text);

  if (undefined === character) {
    msg.bot.say(msg.sid, "请正确输入角色名称。", msg.type, msg.uid);
    return;
  }

  try {
    let dbInfo = isMyChar ? await getID(msg.text, msg.uid) : await getUID(msg.text);
    let baseInfo;

    if (!isMyChar && (!dbInfo || "string" === typeof dbInfo)) {
      dbInfo = await getID(msg.text, msg.uid); // 米游社 ID
    }

    if ("string" === typeof dbInfo) {
      msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid);
      return;
    }

    if (Array.isArray(dbInfo)) {
      baseInfo = dbInfo;
      uid = baseInfo[0];
    } else {
      baseInfo = await basePromise(dbInfo, msg.uid, msg.bot);
      uid = baseInfo[0];
    }

    data = await getCharacter(uid, character);

    if (!data) {
      if (!config.characterTryGetDetail) {
        msg.bot.say(msg.sid, await getNotFoundText(character, isMyChar), msg.type, msg.uid);
        return;
      } else {
        const detailInfo = await detailPromise(...baseInfo, msg.uid, msg.bot);
        await characterPromise(...baseInfo, detailInfo, msg.bot);
        data = await getCharacter(uid, character);
      }
    }
  } catch (e) {
    const ret = await handleDetailError(e);

    if (!ret) {
      msg.bot.sayMaster(msg.sid, e, msg.type, msg.uid);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && msg.bot.say(msg.sid, ret[0], msg.type, msg.uid);
      ret[1] && msg.bot.sayMaster(msg.sid, ret[1], msg.type, msg.uid);
      return;
    }
  }

  if (!data) {
    msg.bot.say(msg.sid, await getNotFoundText(character, isMyChar), msg.type, msg.uid);
    return;
  }

  render(msg, { uid, data }, "genshin-character");
}

export { doCharacter };
