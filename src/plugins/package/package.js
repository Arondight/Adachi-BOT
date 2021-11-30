import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { baseDetail, characterDetail, handleDetailError, indexDetail } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";
import { filterWordsByRegex } from "../../utils/tools.js";

async function doPackage(msg) {
  let dbInfo = getID(msg.text, msg.uid, false); // UID
  const args = filterWordsByRegex(msg.text, ...global.command.functions.entrance.package);

  if ("string" === typeof dbInfo) {
    msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
    return;
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
    await characterDetail(...dbInfo, detailInfo, true, msg.bot);
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

  const data = db.get("info", "user", { uid: dbInfo[0] });
  const qqid = "" === args ? msg.uid : msg.text.includes("[CQ:at") ? parseInt(msg.text.match(/\d+/g)[0]) : undefined;

  if (undefined !== qqid) {
    data.qqid = qqid;
  }

  render(msg, data, "genshin-package");
}

export { doPackage };
