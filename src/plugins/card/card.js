import db from "#utils/database";
import { baseDetail, characterDetail, handleDetailError, indexDetail } from "#utils/detail";
import { getID } from "#utils/id";
import { render } from "#utils/render";
import { filterWordsByRegex } from "#utils/tools";

("use strict");

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
    if (handleDetailError(msg, e)) {
      return;
    }
  }

  let qqid;

  if (msg.text.includes("[CQ:at")) {
    qqid = parseInt(msg.text.match(/\d+/g)[0]);
  }

  if ("" === args) {
    qqid = msg.uid;
  }

  const data = Object.assign(db.get("info", "user", { uid }), {
    character: global.info.character.map((c) => ({ id: c.id, name: c.name })),
    qqid,
  });

  render(msg, data, "genshin-card");
}

export { doCard };
