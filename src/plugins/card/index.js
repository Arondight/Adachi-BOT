import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import {
  basePromise,
  detailPromise,
  characterPromise,
} from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

const generateImage = async (uid, id, type, user) => {
  const data = await db.get("info", "user", { uid });
  await render(data, "genshin-card", id, type, user);
};

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let dbInfo = await getID(msg, userID); // 米游社 ID
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
    const baseInfo = await basePromise(dbInfo, userID);
    uid = baseInfo[0];
    const detailInfo = await detailPromise(...baseInfo, userID);
    await characterPromise(...baseInfo, detailInfo);
  } catch (errInfo) {
    if (errInfo !== "") {
      await bot.sendMessage(sendID, errInfo, type, userID);
      return;
    }
  }

  await generateImage(uid, sendID, type, userID);
}

export { Plugin as run };
