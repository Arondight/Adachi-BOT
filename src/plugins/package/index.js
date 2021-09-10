import { render } from "../../utils/render.js";
import { get } from "../../utils/database.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { detailPromise, characterPromise } from "../../utils/detail.js";

async function generateImage(uid, id, type) {
  let data = await get("info", "user", { uid });
  await render(data, "genshin-info", id, type);
}

function getID(msg) {
  let id = msg.match(/\d+/g);
  let errInfo = "";

  if (
    id.length > 1 ||
    id[0].length !== 9 ||
    (id[0][0] !== "1" && id[0][0] !== "5")
  ) {
    errInfo = "输入 UID 不合法。";
    return errInfo;
  }

  let uid = parseInt(id[0]);
  let region = id[0][0] === "1" ? "cn_gf01" : "cn_qd01";
  return [uid, region];
}

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let dbInfo = getID(msg);

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type);
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

  try {
    const detailInfo = await detailPromise(...dbInfo, userID);
    await characterPromise(...dbInfo, detailInfo);
  } catch (errInfo) {
    if (errInfo !== "") {
      await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ` + errInfo, type);
      return;
    }
  }

  await generateImage(dbInfo[0], sendID, type);
}

export { Plugin as run };
