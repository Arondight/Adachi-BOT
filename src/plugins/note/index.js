/* global alias, command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { basePromise, notePromise } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";
import { setUserCookie } from "../../utils/cookie.js";

function getTime(s, offset) {
  const sec = parseInt(s + offset);
  const min = parseInt(sec / 60);
  const hour = parseInt(min / 60);
  const day = parseInt(hour / 24);
  return [day, hour % 24, min % 60, sec % 60];
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const sendID = "group" === type ? groupID : userID;
  const dbInfo = await getID(msg, userID); // 米游社 ID
  let uid, data, region, baseTime;

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
      const cookie = msg.slice(9);
      setUserCookie(uid, cookie, bot);
      await bot.sendMessage(sendID, `已设置cookie`, type, userID);
      return;
    }
    region = baseInfo[1];
    const noteInfo = await notePromise(uid, region, userID, bot);
    data = noteInfo[1];
    baseTime = noteInfo[0];
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
  const nowTime = new Date().valueOf();
  let message = `树脂${data.current_resin}/${data.max_resin} 委托${data.finished_task_num}/${data.total_task_num} 派遣${data.current_expedition_num}/${data.max_expedition_num}`;
  let [day, hour, min, sec] = getTime(parseInt(data.resin_recovery_time), (baseTime - nowTime)/1000);
  message += `
树脂回满时间：${hour}时${min}分${sec}秒`;
    let num = 1;
    for (var expedition of data.expeditions) {
        if (expedition && expedition.status == "Ongoing") {
            [day, hour, min, sec] = getTime(parseInt(expedition.remained_time), (baseTime - nowTime) / 1000);
            message += `
派遣${num}：${hour}时${min}分${sec}秒`;
        }
        num++;
    }
  await bot.sendMessage(sendID, message , type, userID);
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
