const {
  basePromise,
  detailPromise,
  characterPromise,
} = require("../../utils/detail");
const { get, isInside, getID } = require("../../utils/database");
const { hasAuth, sendPrompt } = require("../../utils/auth");
const { render } = require("../../utils/render");

const generateImage = async (uid, id, type) => {
  const data = await get("info", "user", { uid });
  await render(data, "genshin-card", id, type);
};

module.exports = async (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let dbInfo = await getID(msg, userID),
    uid;

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type);
    return;
  }

  if (typeof dbInfo === "string") {
    await bot.sendMessage(sendID, dbInfo.toString(), type);
    return;
  }

  try {
    const baseInfo = await basePromise(dbInfo, userID);
    uid = baseInfo[0];
    const detailInfo = await detailPromise(...baseInfo, userID);
    await characterPromise(...baseInfo, detailInfo);
  } catch (errInfo) {
    if (errInfo !== "") {
      await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] ` + errInfo, type);
      return;
    }
  }

  await generateImage(uid, sendID, type);
};
