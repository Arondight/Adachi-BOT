import db from "../../utils/database.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { errMsg, musicID, musicSrc } from "./music.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let ret, data, src;

  if (!(await hasAuth(userID, "music")) || !(await hasAuth(sendID, "music"))) {
    await sendPrompt(sendID, userID, name, "点歌", type);
    return;
  }

  switch (true) {
    case msg.startsWith("点歌"):
      data = await db.get("music", "source", { ID: sendID });
      src = data ? data["Source"] : "163";
      ret = await musicID(msg, src);

      if (ret in errMsg) {
        return await bot.sendMessage(
          sendID,
          `[CQ:at,qq=${userID}] ` + errMsg[ret],
          type
        );
      }

      await bot.sendMessage(sendID, ret, type);
      break;
    case msg.startsWith("音乐源"):
      ret = await musicSrc(msg, sendID);
      return await bot.sendMessage(
        sendID,
        ret ? `音乐源已切换为${ret}。` : "音乐源切换失败。",
        type
      );
      break;
  }
}

export { Plugin as run };
