import { alias } from "../../utils/alias.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { get, isInside, getID } from "../../utils/database.js";
import { basePromise } from "../../utils/detail.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let dbInfo = await getID(msg, userID);
  let [character] = msg.split(/(?<=^\S+)\s/).slice(1);
  let uid, data;

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, "查询游戏内信息", type);
    return;
  }

  if (typeof dbInfo === "string") {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] ` + dbInfo.toString(),
      type
    );
    return;
  }

  if (!character) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 请正确输入角色名称。`,
      type
    );
    return;
  }

  try {
    const baseInfo = await basePromise(dbInfo, userID);
    uid = baseInfo[0];
    const { avatars } = await get("info", "user", { uid });
    character = alias(character);
    data = avatars.find((el) => el.name === character);

    if (!data) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 查询失败，如果您拥有该角色，使用【米游社】或【UID 你的游戏UID】更新游戏角色后再次查询。`,
        type
      );
      return;
    }
  } catch (errInfo) {
    if (errInfo !== "") {
      await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ` + errInfo, type);
      return;
    }
  }

  await render({ uid, data }, "genshin-character", sendID, type);
}

export { Plugin as run };
