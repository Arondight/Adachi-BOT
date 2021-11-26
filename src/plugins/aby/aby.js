import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { abyPromise, basePromise, handleDetailError } from "../../utils/detail.js";
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

      const baseInfo = await basePromise(dbInfo, msg.uid, msg.bot);
      const uid = baseInfo[0];
      dbInfo = getID(uid, msg.uid, false); // UID

      if ("string" === typeof dbInfo) {
        msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
        return;
      }
    }

    const abyInfo = await abyPromise(...dbInfo, msg.uid, schedule_type.toString(), msg.bot);

    if (!abyInfo) {
      msg.bot.say(msg.sid, "您似乎从未挑战过深境螺旋。", msg.type, msg.uid, true);
      return;
    }

    if (Array.isArray(abyInfo.floors) && 0 === abyInfo.floors.length) {
      msg.bot.say(msg.sid, "无渊月螺旋记录。", msg.type, msg.uid, true);
      return;
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

  const data = db.get("aby", "user", { uid: dbInfo[0] });
  render(msg, data, "genshin-aby");
}

export { doAby };
