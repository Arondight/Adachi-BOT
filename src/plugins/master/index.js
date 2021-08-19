const { isMaster, setAuth, sendPrompt } = require("../../utils/auth");
const { gachaUpdate } = require("../../utils/update");

const parse = (msg) => {
  let id = parseInt(msg.match(/[0-9]+/g)[0]);
  let isOn = msg.includes("on");

  return [id, isOn];
};

const response = async (id, target, auth, type, isOn) => {
  await bot.sendMessage(id, `我已经开始${isOn}${target}的${auth}功能！`, type);
};

const setFeedbackAuth = async (msg, id, type) => {
  let [target, isOn] = parse(msg);
  await setAuth("feedback", target, isOn);
  await response(id, target, "带话", type, isOn ? "允许" : "禁止");
};

const setMusicAuth = async (msg, id, type) => {
  let [target, isOn] = parse(msg);
  await setAuth("music", target, isOn);
  await response(id, target, "点歌", type, isOn ? "允许" : "禁止");
};

const setGachaAuth = async (msg, id, type) => {
  let [target, isOn] = parse(msg);
  await setAuth("gacha", target, isOn);
  await response(id, target, "祈愿十连", type, isOn ? "允许" : "禁止");
};

const setArtifactAuth = async (msg, id, type) => {
  let [target, isOn] = parse(msg);
  await setAuth("artifact", target, isOn);
  await response(id, target, "抽取圣遗物", type, isOn ? "允许" : "禁止");
};

const setQueryGameInfoAuth = async (msg, id, type) => {
  let [target, isOn] = parse(msg);
  await setAuth("query", target, isOn);
  await response(id, target, "查询游戏内信息", type, isOn ? "允许" : "禁止");
};

const setCharacterOverviewAuth = async (msg, id, type) => {
  let [target, isOn] = parse(msg);
  await setAuth("overview", target, isOn);
  await response(id, target, "查询官方信息", type, isOn ? "允许" : "禁止");
};

const setReplyGroupAuth = async (msg, id, type) => {
  let [target, isOn] = parse(msg);
  await setAuth("replyGroup", target, isOn);
  await response(id, target, "响应群消息", type, isOn ? "允许" : "禁止");
  await bot.sendMessage(target, "主人已禁止我在本群作出任何响应。", "group");
};

const refreshWishDetail = async (id, type) => {
  gachaUpdate();
  await bot.sendMessage(id, "卡池内容已刷新。", type);
};

module.exports = async (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;

  if (!isMaster(userID)) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 不能使用管理命令。`,
      type
    );
    return;
  }

  switch (true) {
    case msg.includes("带话权限"):
      await setFeedbackAuth(msg, sendID, type);
      break;
    case msg.includes("点歌权限"):
      await setMusicAuth(msg, sendID, type);
      break;
    case msg.includes("十连权限"):
      await setGachaAuth(msg, sendID, type);
      break;
    case msg.includes("圣遗物权限"):
      await setArtifactAuth(msg, sendID, type);
      break;
    case msg.includes("游戏数据权限"):
      await setQueryGameInfoAuth(msg, sendID, type);
      break;
    case msg.includes("官方数据权限"):
      await setCharacterOverviewAuth(msg, sendID, type);
      break;
    case msg.includes("响应群消息"):
      await setReplyGroupAuth(msg, sendID, type);
      break;
    case msg.includes("刷新卡池"):
      await refreshWishDetail(sendID, type);
      break;
  }
};
