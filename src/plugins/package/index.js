import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import {
  basePromise,
  detailPromise,
  characterPromise,
} from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

async function generateImage(uid, id, type) {
  let data = await db.get("info", "user", { uid });
  await render(data, "genshin-info", id, type);
}

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let dbInfo = await getID(msg, userID, false); // UID

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type);
    return;
  }

  if ("string" === typeof dbInfo) {
    await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ${dbInfo}`, type);
    return;
  }

  try {
    // 这里处理 undefined 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (undefined === dbInfo) {
      dbInfo = await getID(msg, userID); // 米游社 ID

      if ("string" === typeof dbInfo) {
        await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ${dbInfo}`, type);
        return;
      }

      const baseInfo = await basePromise(dbInfo, userID);
      const uid = baseInfo[0];
      dbInfo = await getID(uid, userID, false); // UID

      if ("string" === typeof dbInfo) {
        await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ${dbInfo}`, type);
        return;
      }
    }

    const detailInfo = await detailPromise(...dbInfo, userID);
    await characterPromise(...dbInfo, detailInfo);
  } catch (errInfo) {
    if (errInfo !== "") {
      await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ` + errInfo, type);
      return;
    }
  }

  await generateImage(dbInfo[0], sendID, type);
}

export { Plugin as run };
