import db from "#utils/database";
import { abyDetail, baseDetail, handleDetailError } from "#utils/detail";
import { getID } from "#utils/id";
import { render } from "#utils/render";

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
    if (handleDetailError(msg, e)) {
      return;
    }
  }

  const data = db.get("aby", "user", { uid: dbInfo[0] });
  render(msg, data, "genshin-aby");
}

export { doAby };
