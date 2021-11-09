/* global all */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { errMsg, musicID, musicSrc } from "./data.js";

async function doMusic(msg) {
  const data = await db.get("music", "source", { ID: msg.sid });
  const src = data ? data.Source : all.functions.options.music_source[163] || "163";
  const ret = await musicID(msg.text, src);

  if (ret in errMsg) {
    msg.bot.say(msg.sid, errMsg[ret], msg.type, msg.uid);
  }

  msg.bot.say(msg.sid, ret, msg.type); // 点歌不需要 @
}

async function doMusicSource(msg) {
  const ret = await musicSrc(msg.text, msg.sid);
  msg.bot.say(msg.sid, ret ? `音乐源已切换为 ${ret} 。` : "音乐源切换失败。", msg.type, msg.uid);
}

export { doMusic, doMusicSource };
