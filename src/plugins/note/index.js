/* global alias, command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { basePromise, notePromise } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";
import { setUserCookie } from "../../utils/cookie.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const sendID = "group" === type ? groupID : userID;
  const dbInfo = await getID(msg, userID); // 米游社 ID
  const cookie = msg.slice(4);
  let uid, data, region;

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, "查询游戏内信息", type, bot);
    return;
  }

  if ("string" === typeof dbInfo) {
    await bot.sendMessage(sendID, dbInfo, type, userID);
    return;
  }

  try {
    const baseInfo = await basePromise(dbInfo, userID, bot);
    uid = baseInfo[0];
    if (hasEntrance(msg, "note", "set_user_cookie")) {
      setUserCookie(uid, cookie, bot);
      await bot.sendMessage(sendID, `已设置cookie`, type, userID);
      return;
    }
    region = baseInfo[1];
    data = await notePromise(uid, region, userID, bot);
    if (!data) {
      await bot.sendMessage(
        sendID,
        `获取实时便笺失败`,
        type,
        userID
      );
      return;
    }
  } catch (e) {
    // 抛出空串则使用缓存
    if ("" !== e) {
      await bot.sendMessage(sendID, e, type, userID);
      return;
    }
  }
  await bot.sendMessage(sendID, data, type, userID);
  //await render({ uid, data }, "genshin-note", sendID, type, userID, bot);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
