import fs from "fs";
import path from "path";
import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { getID, getUID } from "../../utils/id.js";
import { baseDetail, characterDetail, handleDetailError, indexDetail } from "../../utils/detail.js";

function getCharacter(uid, character) {
  const { avatars } = db.get("info", "user", { uid }) || {};
  return avatars ? avatars.find((e) => e.name === character) : false;
}

function getNotFoundText(character, isMyChar, guess = []) {
  const cmd = [global.command.functions.name.card, global.command.functions.name.package];
  const cmdStr = `【${cmd.join("】、【")}】`;
  const text = global.config.characterTryGetDetail
    ? `看上去${isMyChar ? "您" : "他"}尚未拥有或公开此角色，当前米游社只能查询八个角色`
    : `如果${isMyChar ? "您" : "他"}拥有该角色并已经公开，使用${cmdStr}更新游戏角色后再次查询`;
  let notFoundText = `查询失败，${text}。`;

  if (!global.names.character.includes(character) && guess.length > 0) {
    notFoundText += `\n您要查询的是不是：\n${guess.join("、")}`;
  }

  return notFoundText;
}

async function doCharacter(msg, name, isMyChar = false, guess = []) {
  let uid;
  let data;

  const character = global.names.characterAlias[name] || name;

  if (undefined === character) {
    msg.bot.say(msg.sid, "请正确输入角色名称。", msg.type, msg.uid, true);
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
      baseInfo = await baseDetail(dbInfo, msg.uid, msg.bot);
      uid = baseInfo[0];
    }

    data = getCharacter(uid, character);

    if (!data) {
      if (!global.config.characterTryGetDetail) {
        const text = getNotFoundText(character, isMyChar, guess);
        msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
        return;
      } else {
        const detailInfo = await indexDetail(...baseInfo, msg.uid, msg.bot);
        await characterDetail(...baseInfo, detailInfo, false, msg.bot);
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
    const text = getNotFoundText(character, isMyChar, guess);
    msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
    return;
  }

  // 转换图片 URL 为本地资源
  for (const i in data.artifact) {
    if ("string" === typeof data.artifact[i].icon && data.artifact[i].icon.includes("UI_RelicIcon")) {
      const id = data.artifact[i].icon
        .match(/UI_RelicIcon_(\d+?)_(\d)/)
        .slice(-2)
        .map((c) => parseInt(c));

      if (Array.isArray(id) && 2 === id.length) {
        let base = path.parse(data.artifact[i].icon).base.replace(/^UI_RelicIcon_/, "");
        base = base.replace(/^\d+?(?=_)/, global.artifacts.artifacts.icon[id[0]]);
        base = base.replace(/(?<=^\d+?)_\d(?=[.])/, `/${global.artifacts.path.indexOf(id[1])}`);

        try {
          fs.accessSync(path.resolve(global.rootdir, "resources", "Version2", "artifact", base), fs.constants.R_OK);
          data.artifact[i].icon = `http://localhost:9934/resources/Version2/artifact/${base}`;
        } catch (e) {
          continue;
        }
      }
    }
  }

  render(msg, { uid, data }, "genshin-character");
}

export { doCharacter };
