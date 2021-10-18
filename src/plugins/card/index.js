import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import {
  basePromise,
  detailPromise,
  characterPromise,
} from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

const generateImage = async (uid, id, type, user, bot) => {
  const data = await db.get("info", "user", { uid });
  await render(data, "genshin-card", id, type, user, bot);
};

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const dbInfo = await getID(msg, userID); // 米游社 ID
  let uid;

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type);
    return;
  }

  if ("string" === typeof dbInfo) {
    await bot.sendMessage(sendID, dbInfo, type, userID);
    return;
  }

  if (!dbInfo) {
    await bot.sendMessage(sendID, "请正确输入米游社通行证 ID。", type, userID);
    return;
  }

  try {
    const baseInfo = await basePromise(dbInfo, userID, bot);
    uid = baseInfo[0];
    const detailInfo = await detailPromise(...baseInfo, userID, bot);
    await characterPromise(...baseInfo, detailInfo, bot);
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

  await generateImage(uid, sendID, type, userID, bot);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
