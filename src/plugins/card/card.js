import { getEmoticons } from "#utils/api";
import db from "#utils/database";
import { baseDetail, characterDetail, handleDetailError, indexDetail } from "#utils/detail";
import { getID } from "#utils/id";
import { render } from "#utils/render";
import { filterWordsByRegex } from "#utils/tools";

async function doCard(msg) {
  const dbInfo = getID(msg.text, msg.uid); // 米游社 ID
  const args = filterWordsByRegex(msg.text, ...global.command.functions.entrance.card);
  let uid;
  let emoticons;

  if ("string" === typeof dbInfo) {
    msg.bot.say(msg.sid, dbInfo, msg.type, msg.uid, true);
    return;
  }

  if (!dbInfo) {
    msg.bot.say(msg.sid, "请正确输入米游社通行证 ID。", msg.type, msg.uid, true);
    return;
  }

  try {
    emoticons = await getEmoticons();
  } catch (e) {
    emoticons = [];
  }

  try {
    const baseInfo = await baseDetail(dbInfo, msg.uid, msg.bot);
    uid = baseInfo[0];
    const detailInfo = await indexDetail(...baseInfo, msg.uid, msg.bot);
    await characterDetail(...baseInfo, detailInfo, false, msg.bot);
  } catch (e) {
    if (true === handleDetailError(msg, e)) {
      return;
    }
  }

  const data = db.get("info", "user", { uid });
  const qqid = "" === args ? msg.uid : msg.text.includes("[CQ:at") ? parseInt(msg.text.match(/\d+/g)[0]) : undefined;

  if (undefined !== qqid) {
    data.qqid = qqid;
  }

  data.emoticons = emoticons;

  render(msg, data, "genshin-card-8");
}

export { doCard };
