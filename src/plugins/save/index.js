import db from "../../utils/database.js";
import { getID } from "../../utils/id.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = "group" === type ? groupID : userID;
  let id = await getID(msg, userID); // 米游社 ID，这里正则限定了 msg 必然有 ID
  let mhyID = id;

  if ("string" === typeof id) {
    await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ${id}`, type);
    return;
  }

  if (msg.startsWith("绑定")) {
    if (!(await db.includes("map", "user", "userID", userID))) {
      await db.push("map", "user", { userID, mhyID });

      if (!(await db.includes("time", "user", "mhyID", mhyID))) {
        await db.push("time", "user", { mhyID, time: 0 });
      }

      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 通行证绑定成功，使用【米游社】来查询游戏信息并更新你的游戏角色。`,
        type
      );
    } else {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 您已绑定通行证，请使用【改绑 ${mhyID}】。`,
        type
      );
    }
  } else if (msg.startsWith("改绑")) {
    if (await db.includes("map", "user", "userID", userID)) {
      await db.update("map", "user", { userID }, { mhyID });
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 通行证改绑成功，使用【米游社】来查询游戏信息并更新你的游戏角色。`,
        type
      );
    } else {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 您还未绑定通行证，请使用【绑定 ${mhyID}】。`,
        type
      );
    }
  }
}

export { Plugin as run };
