/* global alias, command, config */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { getID, getUID } from "../../utils/id.js";
import { hamming, simhash, getWordByRegex, filterWordsByRegex, guessPossibleNames } from "../../utils/tools.js";
import { basePromise, detailPromise, characterPromise, handleDetailError } from "../../utils/detail.js";

function getCharacter(uid, character) {
  const { avatars } = db.get("info", "user", { uid }) || {};
  return avatars ? avatars.find((e) => e.name === character) : false;
}

function getNotFoundText(character, isMyChar) {
  const cmd = [command.functions.name.card, command.functions.name.package];
  const cmdStr = `【${cmd.join("】、【")}】`;
  const text = config.characterTryGetDetail
    ? `看上去${isMyChar ? "您" : "他"}尚未拥有该角色`
    : `如果${isMyChar ? "您" : "他"}拥有该角色，使用${cmdStr}更新游戏角色后再次查询`;
  const guess = guessPossibleNames(character, Object.keys(alias.characterNames));
  const notFoundText = `查询失败，${text}。${guess.length > 0 ? "\n您要查询的是不是：\n" + guess.join("、") : ""}`;

  return notFoundText;
}

function getName(text) {
  let character = filterWordsByRegex(
    text,
    ...[...command.functions.entrance.character, ...command.functions.entrance.others_character]
  );

  if (character.startsWith("的")) {
    const match = getWordByRegex(character, /的/);
    character = getWordByRegex(match[1] || match[2], /\S+/)[0];
  }

  if (!character) {
    return undefined;
  }

  character = "string" === typeof character ? character.toLowerCase() : "";
  character = alias.character[character] || character;

  return character;
}

function isPossibleName(name) {
  const hash = simhash(name);

  for (const h of Object.values(alias.characterNames)) {
    // 此处汉明距离 < 5 则认为双方具有较高的相似性
    if (hamming(h, hash) < 5) {
      return true;
    }
  }

  return false;
}

async function doCharacter(msg, isMyChar = true) {
  let uid;
  let data;

  const character = getName(msg.text);

  if (undefined === character) {
    msg.bot.say(msg.sid, "请正确输入角色名称。", msg.type, msg.uid, true);
    return;
  }

  if (!isPossibleName(character)) {
    return;
  }

  try {
    let dbInfo = isMyChar ? getID(msg.text, msg.uid) : getUID(msg.text);
    let baseInfo;

    if (!isMyChar && (!dbInfo || "string" === typeof dbInfo)) {
      dbInfo = getID(msg.text, msg.uid); // 米游社 ID
    }

    if ("string" === typeof dbInfo) {
      msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
      return;
    }

    if (Array.isArray(dbInfo)) {
      baseInfo = dbInfo;
      uid = baseInfo[0];
    } else {
      baseInfo = await basePromise(dbInfo, msg.uid, msg.bot);
      uid = baseInfo[0];
    }

    data = getCharacter(uid, character);

    if (!data) {
      if (!config.characterTryGetDetail) {
        msg.bot.say(msg.sid, getNotFoundText(character, isMyChar), msg.type, msg.uid, true);
        return;
      } else {
        const detailInfo = await detailPromise(...baseInfo, msg.uid, msg.bot);
        await characterPromise(...baseInfo, detailInfo, msg.bot);
        data = getCharacter(uid, character);
      }
    }
  } catch (e) {
    const ret = handleDetailError(e);

    if (!ret) {
      msg.bot.sayMaster(msg.sid, e, msg.type, msg.uid);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && msg.bot.say(msg.sid, ret[0], msg.type, msg.uid, true);
      ret[1] && msg.bot.sayMaster(msg.sid, ret[1], msg.type, msg.uid);
      return;
    }
  }

  if (!data) {
    msg.bot.say(msg.sid, getNotFoundText(character, isMyChar), msg.type, msg.uid, true);
    return;
  }

  render(msg, { uid, data }, "genshin-character");
}

export { doCharacter };
