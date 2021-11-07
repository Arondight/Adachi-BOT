import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { basePromise, detailPromise, characterPromise, handleDetailError } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

async function doCard(msg) {
  const dbInfo = await getID(msg.text, msg.uid); // 米游社 ID
  let uid;

  if ("string" === typeof dbInfo) {
    await msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid);
    return;
  }

  if (!dbInfo) {
    await msg.bot.say(msg.sid, "请正确输入米游社通行证 ID。", msg.type, msg.uid);
    return;
  }

  try {
    const baseInfo = await basePromise(dbInfo, msg.uid, msg.bot);
    uid = baseInfo[0];
    const detailInfo = await detailPromise(...baseInfo, msg.uid, msg.bot);
    await characterPromise(...baseInfo, detailInfo, msg.bot);
  } catch (e) {
    const ret = await handleDetailError(e);

    if (!ret) {
      await msg.bot.sayMaster(msg.sid, e, msg.type, msg.uid);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && (await msg.bot.say(msg.sid, ret[0], msg.type, msg.uid));
      ret[1] && (await msg.bot.sayMaster(msg.sid, ret[1], msg.type, msg.uid));
      return;
    }
  }

  const data = await db.get("info", "user", { uid });
  await render(data, "genshin-card", msg.sid, msg.type, msg.uid, msg.bot);
}

export { doCard };
