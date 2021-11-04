import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sayAuth } from "../../utils/auth.js";
import { basePromise, detailPromise, characterPromise, handleDetailError } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

async function generateImage(uid, id, type, user, bot) {
  const data = await db.get("info", "user", { uid });
  await render(data, "genshin-info", id, type, user, bot);
}

async function Plugin(msg, bot) {
  let dbInfo = await getID(msg.text, msg.uid, false); // UID

  if (!(await hasAuth(msg.uid, "query")) || !(await hasAuth(msg.sid, "query"))) {
    await sayAuth(msg.sid, msg.uid, name, "查询游戏内信息", msg.type, bot);
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

    const detailInfo = await detailPromise(...dbInfo, msg.uid, bot);
    await characterPromise(...dbInfo, detailInfo, bot);
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
