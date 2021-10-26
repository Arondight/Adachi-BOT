import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import {
  basePromise,
  abyPromise,
  handleDetailError,
} from "../../utils/detail.js";
import { hasEntrance } from "../../utils/config.js";
import { getID } from "../../utils/id.js";

async function generateImage(uid, id, type, user, bot) {
  const data = await db.get("aby", "user", { uid });
  await render(data, "genshin-aby", id, type, user, bot, 2);
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  let dbInfo = await getID(msg, userID, false); // UID
  let schedule_type = "1";

  if (hasEntrance(msg, "aby", "lastaby")) {
    schedule_type = "2";
  }

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

    const abyInfo = await abyPromise(...dbInfo, userID, schedule_type, bot);

    if (!abyInfo) {
      await bot.sendMessage(sendID, "您似乎从未挑战过深境螺旋。", type, userID);
      return;
    }

    if (!abyInfo.floors.length) {
      await bot.sendMessage(sendID, "无渊月螺旋记录。", type, userID);
      return;
    }
  } catch (e) {
    const ret = await handleDetailError(e);

    if (!ret) {
      await bot.sendMaster(sendID, e, type, userID);
      return;
    }

    if (Array.isArray(ret)) {
      ret[0] && (await bot.sendMessage(sendID, ret[0], type, userID));
      ret[1] && (await bot.sendMaster(sendID, ret[1], type, userID));
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
