/* global all */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { errMsg, musicID, musicSrc } from "./music.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  let ret, data, src;

  if (!(await hasAuth(userID, "music")) || !(await hasAuth(sendID, "music"))) {
    await sendPrompt(sendID, userID, name, "点歌", type, bot);
    return;
  }

  switch (true) {
    case hasEntrance(msg, "music", "music"):
      data = await db.get("music", "source", { ID: sendID });
      src = data
        ? data.Source
        : all.functions.options.music_source[163] || "163";
      ret = await musicID(msg, src);

      if (ret in errMsg) {
        await bot.sendMessage(sendID, errMsg[ret], type, userID);
        break;
      }

      await bot.sendMessage(sendID, ret, type); // 点歌不需要 @
      break;
    case hasEntrance(msg, "music", "music_source"):
      ret = await musicSrc(msg, sendID);
      await bot.sendMessage(
        sendID,
        ret ? `音乐源已切换为 ${ret} 。` : "音乐源切换失败。",
        type,
        userID
      );
      break;
  }
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
