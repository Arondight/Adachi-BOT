import { isInside, push, update } from "../../utils/database.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = type === "group" ? groupID : userID;
  let id = msg.match(/\d+/g),
    mhyID;

  if (id === null || id.length > 1) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 请正确输入通行证ID。`,
      type
    );
  } else {
    mhyID = parseInt(id[0]);

    if (msg.includes("绑定")) {
      if (!(await isInside("map", "user", "userID", userID))) {
        await push("map", "user", { userID, mhyID });

        if (!(await isInside("time", "user", "mhyID", mhyID))) {
          await push("time", "user", { mhyID, time: 0 });
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
    } else if (msg.includes("改绑")) {
      if (await isInside("map", "user", "userID", userID)) {
        await update("map", "user", { userID }, { mhyID });
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
}

export { Plugin as run };
