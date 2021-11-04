/* global all */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { hasAuth, sayAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { errMsg, musicID, musicSrc } from "./music.js";

async function Plugin(msg, bot) {
  let ret, data, src;

  if (!(await hasAuth(msg.uid, "music")) || !(await hasAuth(msg.sid, "music"))) {
    await sayAuth(msg.sid, msg.uid, msg.name, "点歌", msg.type, bot);
    return;
  }

  switch (true) {
    case hasEntrance(msg.text, "music", "music"):
      data = await db.get("music", "source", { ID: msg.sid });
      src = data ? data.Source : all.functions.options.music_source[163] || "163";
      ret = await musicID(msg.text, src);

      if (ret in errMsg) {
        await bot.say(msg.sid, errMsg[ret], msg.type, msg.uid);
        break;
      }

      await bot.say(msg.sid, ret, msg.type); // 点歌不需要 @
      break;
    case hasEntrance(msg.text, "music", "music_source"):
      ret = await musicSrc(msg.text, msg.sid);
      await bot.say(msg.sid, ret ? `音乐源已切换为 ${ret} 。` : "音乐源切换失败。", msg.type, msg.uid);
      break;
  }
}

export { Plugin as run };
