import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sayAuth } from "../../utils/auth.js";
import { basePromise, abyPromise, handleDetailError } from "../../utils/detail.js";
import { hasEntrance } from "../../utils/config.js";
import { getID } from "../../utils/id.js";

async function generateImage(uid, id, type, user, bot) {
  const data = await db.get("aby", "user", { uid });
  await render(data, "genshin-aby", id, type, user, bot, 2);
}

async function Plugin(msg, bot) {
  let dbInfo = await getID(msg.text, msg.uid, false); // UID
  let schedule_type = "1";

  if (hasEntrance(msg.text, "aby", "lastaby")) {
    schedule_type = "2";
  }

  if (!(await hasAuth(msg.uid, "query")) || !(await hasAuth(msg.sid, "query"))) {
    await sayAuth(msg.sid, msg.uid, msg.name, "查询游戏内信息", msg.type, bot);
    return;
  }

  if ("string" === typeof dbInfo) {
    await bot.say(msg.sid, dbInfo, msg.type, msg.uid);
    return;
  }

  try {
    // 这里处理 undefined 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (undefined === dbInfo) {
      dbInfo = await getID(msg.text, msg.uid); // 米游社 ID

      if ("string" === typeof dbInfo) {
        await bot.say(msg.sid, dbInfo, msg.type, msg.uid);
        return;
      }

      const baseInfo = await basePromise(dbInfo, msg.uid, bot);
      const uid = baseInfo[0];
      dbInfo = await getID(uid, msg.uid, false); // UID

      if ("string" === typeof dbInfo) {
        await bot.say(msg.sid, dbInfo, msg.type, msg.uid);
        return;
      }
    }

    const abyInfo = await abyPromise(...dbInfo, msg.uid, schedule_type, bot);

    if (!abyInfo) {
      await bot.say(msg.sid, "您似乎从未挑战过深境螺旋。", msg.type, msg.uid);
      return;
    }

    if (!abyInfo.floors.length) {
      await bot.say(msg.sid, "无渊月螺旋记录。", msg.type, msg.uid);
      return;
    }
  } catch (e) {
    const ret = await handleDetailError(e);

    if (!ret) {
      await bot.sayMaster(msg.sid, e, msg.type, msg.uid);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && (await bot.say(msg.sid, ret[0], msg.type, msg.uid));
      ret[1] && (await bot.sayMaster(msg.sid, ret[1], msg.type, msg.uid));
      return;
    }
  }

  await generateImage(dbInfo[0], msg.sid, msg.type, msg.uid, bot);
}

export { Plugin as run };
