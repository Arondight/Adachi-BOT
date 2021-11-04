import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sayAuth } from "../../utils/auth.js";
import { basePromise, detailPromise, characterPromise, handleDetailError } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

const generateImage = async (uid, id, type, user, bot) => {
  const data = await db.get("info", "user", { uid });
  await render(data, "genshin-card", id, type, user, bot);
};

async function Plugin(msg, bot) {
  const dbInfo = await getID(msg.text, msg.uid); // 米游社 ID
  let uid;

  if (!(await hasAuth(msg.uid, "query")) || !(await hasAuth(msg.sid, "query"))) {
    await sayAuth(msg.sid, msg.uid, msg.name, "查询游戏内信息", msg.type, bot);
    return;
  }

  if ("string" === typeof dbInfo) {
    await bot.say(msg.sid, dbInfo, msg.type, msg.uid);
    return;
  }

  if (!dbInfo) {
    await bot.say(msg.sid, "请正确输入米游社通行证 ID。", msg.type, msg.uid);
    return;
  }

  try {
    const baseInfo = await basePromise(dbInfo, msg.uid, bot);
    uid = baseInfo[0];
    const detailInfo = await detailPromise(...baseInfo, msg.uid, bot);
    await characterPromise(...baseInfo, detailInfo, bot);
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

  await generateImage(uid, msg.sid, msg.type, msg.uid, bot);
}

export { Plugin as run };
