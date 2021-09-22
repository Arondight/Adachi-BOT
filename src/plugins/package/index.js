import { render } from "../../utils/render.js";
import { get, getID } from "../../utils/database.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import {
  basePromise,
  detailPromise,
  characterPromise,
} from "../../utils/detail.js";

async function generateImage(uid, id, type) {
  let data = await get("info", "user", { uid });
  await render(data, "genshin-info", id, type);
}

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let dbInfo = await getID(msg, userID, false); // UID

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type);
    return;
  }

  if (typeof dbInfo === "string") {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] ` + dbInfo.toString(),
      type
    );
    return;
  }

  try {
    // 这里处理 null 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (!dbInfo) {
      dbInfo = await getID(msg, userID); // 米游社 ID

      if (typeof dbInfo === "string") {
        await bot.sendMessage(
          sendID,
          `[CQ:at,qq=${userID}] ` + dbInfo.toString(),
          type
        );
        return;
      }

      const baseInfo = await basePromise(dbInfo, userID);
      const uid = baseInfo[0];
      dbInfo = await getID(uid, userID, false); // UID

      if (typeof dbInfo === "string") {
        await bot.sendMessage(
          sendID,
          `[CQ:at,qq=${userID}] ` + dbInfo.toString(),
          type
        );
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
