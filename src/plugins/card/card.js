import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { baseDetail, characterDetail, handleDetailError, indexDetail } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";
import { filterWordsByRegex } from "../../utils/tools.js";

async function doCard(msg) {
  const dbInfo = getID(msg.text, msg.uid); // 米游社 ID
  const args = filterWordsByRegex(msg.text, ...global.command.functions.entrance.card);
  let uid;

  if ("string" === typeof dbInfo) {
    msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
    return;
  }

  if (!dbInfo) {
    msg.bot.say(msg.sid, "请正确输入米游社通行证 ID。", msg.type, msg.uid, true);
    return;
  }

  try {
    const baseInfo = await baseDetail(dbInfo, msg.uid, msg.bot);
    uid = baseInfo[0];
    const detailInfo = await indexDetail(...baseInfo, msg.uid, msg.bot);
    await characterDetail(...baseInfo, detailInfo, false, msg.bot);
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

  const data = db.get("info", "user", { uid });
  const qqid = "" === args ? msg.uid : msg.text.includes("[CQ:at") ? parseInt(msg.text.match(/\d+/g)[0]) : undefined;

  if (undefined !== qqid) {
    data.qqid = qqid;
  }

  render(msg, data, "genshin-card");
}

export { doCard };
