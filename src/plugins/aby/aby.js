import lodash from "lodash";
import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { abyDetail, baseDetail, handleDetailError } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

async function doAby(msg, schedule_type = 1) {
  let dbInfo = getID(msg.text, msg.uid, false); // UID

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

    await abyDetail(...dbInfo, msg.uid, schedule_type.toString(), msg.bot);
  } catch (e) {
    if (true === handleDetailError(msg, e)) {
      return;
    }
  }

  const data = db.get("aby", "user", { uid: dbInfo[0] });

  if (lodash.hasIn(data, "data")) {
    if (undefined === data.data.max_floor || "0-0" === data.data.max_floor) {
      msg.bot.say(msg.sid, "您似乎未挑战深境螺旋。", msg.type, msg.uid, true);
      return;
    }

    if (Array.isArray(data.data.floors) && 0 === data.data.floors.length) {
      msg.bot.say(msg.sid, "无渊月螺旋记录。", msg.type, msg.uid, true);
      return;
    }

    render(msg, data, "genshin-aby");
    return;
  }

  msg.bot.say(msg.sid, "没有查询到深渊信息。", msg.type, msg.uid, true);
  return;
}

export { doAby };
