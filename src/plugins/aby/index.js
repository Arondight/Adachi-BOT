const { abyPromise } = require("../../utils/detail");
const { hasAuth, sendPrompt } = require("../../utils/auth");
const { get } = require("../../utils/database");
const { render } = require("../../utils/render");

const generateImage = async (uid, id, type) => {
  let data = await get("aby", "user", { uid });
  await render(data, "genshin-aby", id, type);
};

const getID = (msg) => {
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
};

module.exports = async (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let dbInfo = getID(msg);
  let schedule_type = msg.includes("上期深渊") ? "2" : "1";

  if (!(await hasAuth(userID, "query")) || !(await hasAuth(sendID, "query"))) {
    await sendPrompt(sendID, userID, name, "查询游戏内信息", type);
    return;
  }

  if (typeof dbInfo === "string") {
    await bot.sendMessage(sendID, dbInfo.toString(), type);
    return;
  }
  try {
    const abyInfo = await abyPromise(...dbInfo, schedule_type);
    if (!abyInfo) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 您似乎从未挑战过深境螺旋。`,
        type
      );
      return;
    }
    if (!abyInfo["floors"].length) {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 无渊月螺旋记录。`,
        type
      );
      return;
    }
  } catch (errInfo) {
    if (errInfo !== "") {
      await bot.sendMessage(sendID, errInfo, type);
      return;
    }
  }
  await generateImage(dbInfo[0], sendID, type);
};
