import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import {
  basePromise,
  detailPromise,
  characterPromise,
} from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

async function generateImage(uid, id, type, user, bot) {
  const data = await db.get("info", "user", { uid });
  await render(data, "genshin-info", id, type, user, bot);
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  let dbInfo = await getID(msg, userID, false); // UID

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type, bot);
    return;
  }

  if ("string" === typeof dbInfo) {
    await bot.sendMessage(sendID, dbInfo, type, userID);
    return;
  }

  try {
    // 这里处理 undefined 返回值，如果没有给出 UID，通过 QQ 号查询 UID
    if (undefined === dbInfo) {
      dbInfo = await getID(msg, userID); // 米游社 ID

      if ("string" === typeof dbInfo) {
        await bot.sendMessage(sendID, dbInfo, type, userID);
        return;
      }

      const baseInfo = await basePromise(dbInfo, userID, bot);
      const uid = baseInfo[0];
      dbInfo = await getID(uid, userID, false); // UID

      if ("string" === typeof dbInfo) {
        await bot.sendMessage(sendID, dbInfo, type, userID);
        return;
      }
    }

    const detailInfo = await detailPromise(...dbInfo, userID, bot);
    await characterPromise(...dbInfo, detailInfo, bot);
  } catch (e) {
    if (true === e.detail) {
      // 尝试使用缓存
      if (true !== e.cache) {
        if ("string" === typeof e.message) {
          await bot.sendMessage(sendID, e.message, type, userID);
        }
        if (true === e.master && "string" === typeof e.message_master) {
          await bot.sendMaster(sendID, e.message_master, type, userID);
        }
        return;
      }
    } else {
      await bot.sendMessage(sendID, e, type, userID);
      return;
    }
  }

  await generateImage(dbInfo[0], sendID, type, userID, bot);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
