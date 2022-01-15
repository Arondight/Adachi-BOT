import db from "../../utils/database.js";
import { getEmoticons } from "../../utils/api.js";
import { render } from "../../utils/render.js";
import { baseDetail, characterDetail, handleDetailError, indexDetail } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";
import { filterWordsByRegex } from "../../utils/tools.js";

async function doPackage(msg) {
  const args = filterWordsByRegex(msg.text, ...global.command.functions.entrance.package);
  let dbInfo = getID(msg.text, msg.uid, false); // UID
  let emoticons;

  if ("string" === typeof dbInfo) {
    msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
    return;
  }

  try {
    emoticons = await getEmoticons();
  } catch (e) {
    emoticons = [];
  }

  try {
    // 这里处理 undefined 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (undefined === dbInfo) {
      dbInfo = getID(msg.text, msg.uid); // 米游社 ID

      if ("string" === typeof dbInfo) {
        msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
        return;
      }

      const baseInfo = await baseDetail(dbInfo, msg.uid, msg.bot);
      const uid = baseInfo[0];
      dbInfo = getID(uid, msg.uid, false); // UID

      if ("string" === typeof dbInfo) {
        msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
        return;
      }
    }

    const detailInfo = await indexDetail(...dbInfo, msg.uid, msg.bot);
    await characterDetail(...dbInfo, detailInfo, false, msg.bot);
  } catch (e) {
    if (true === handleDetailError(msg, e)) {
      return;
    }
  }

  const data = db.get("info", "user", { uid: dbInfo[0] });
  const qqid = "" === args ? msg.uid : msg.text.includes("[CQ:at") ? parseInt(msg.text.match(/\d+/g)[0]) : undefined;

  if (undefined !== qqid) {
    data.qqid = qqid;
  }

  data.emoticons = emoticons;

  render(msg, data, "genshin-card-8");
}

export { doPackage };
