/* global alias, command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { basePromise } from "../../utils/detail.js";
import { getID } from "../../utils/id.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const dbInfo = await getID(msg, userID); // 米游社 ID
  let [character] = msg.split(/(?<=^\S+)\s/).slice(1);
  let uid, data;

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, "查询游戏内信息", type, bot);
    return;
  }

  if ("string" === typeof dbInfo) {
    await bot.sendMessage(sendID, dbInfo, type, userID);
    return;
  }

  if (!character) {
    await bot.sendMessage(sendID, "请正确输入角色名称。", type, userID);
    return;
  }

  try {
    const baseInfo = await basePromise(dbInfo, userID, bot);
    uid = baseInfo[0];
    const { avatars } = await db.get("info", "user", { uid });
    character = alias[character] || character;
    data = avatars.find((el) => el.name === character);

    if (!data) {
      await bot.sendMessage(
        sendID,
        `查询失败，如果您拥有该角色，使用【${command.functions.entrance.card[0]}】或【${command.functions.entrance.package[0]}】更新游戏角色后再次查询。`,
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

  await render({ uid, data }, "genshin-character", sendID, type, userID, bot);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
