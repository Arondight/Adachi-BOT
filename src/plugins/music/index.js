import db from "../../utils/database.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { errMsg, musicID, musicSrc } from "./music.js";

async function Plugin(Message, bot) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let ret, data, src;

  if (!(await hasAuth(userID, "music")) || !(await hasAuth(sendID, "music"))) {
    await sendPrompt(sendID, userID, name, "点歌", type, bot);
    return;
  }

  switch (true) {
    case hasEntrance(msg, "music", "music"):
      data = await db.get("music", "source", { ID: sendID });
      src = data ? data["Source"] : "163";
      ret = await musicID(msg, src);

      if (ret in errMsg) {
        return await bot.sendMessage(sendID, errMsg[ret], type, userID);
      }

      await bot.sendMessage(sendID, ret, type); // 点歌不需要 @
      break;
    case hasEntrance(msg, "music", "music_source"):
      ret = await musicSrc(msg, sendID);
      return await bot.sendMessage(
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
