import { render } from "../../utils/render.js";
import { get, getID } from "../../utils/database.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { basePromise, abyPromise } from "../../utils/detail.js";

async function generateImage(uid, id, type) {
  let data = await get("aby", "user", { uid });
  await render(data, "genshin-aby", id, type);
}

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let dbInfo = await getID(msg, userID, false); // UID
  let schedule_type = msg.includes("上期深渊") ? "2" : "1";

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type);
    return;
  }

  if (typeof dbInfo === "string") {
    await bot.sendMessage(sendID, dbInfo.toString(), type);
    return;
  }

  try {
    // 如果没有给出 UID，通过 QQ 号查询 UID
    if (!dbInfo) {
      dbInfo = await getID(msg, userID); // 米游社 ID
      const baseInfo = await basePromise(dbInfo, userID);
      const uid = baseInfo[0];
      dbInfo = await getID(uid, userID, false); // UID
    }

    const abyInfo = await abyPromise(...dbInfo, schedule_type);

    if (!abyInfo) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 您似乎从未挑战过深境螺旋。`,
        type
      );
      return;
    }

    if (!abyInfo["floors"].length) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 无渊月螺旋记录。`,
        type
      );
      return;
    }
  } catch (errInfo) {
    if (errInfo !== "") {
      await bot.sendMessage(sendID, errInfo, type);
      return;
    }
  }

  await generateImage(dbInfo[0], sendID, type);
}

export { Plugin as run };
