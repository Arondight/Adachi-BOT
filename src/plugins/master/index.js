import { gachaUpdate } from "../../utils/update.js";
import { isMaster, setAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";

function parse(msg) {
  let id = parseInt(msg.match(/[0-9]+/g)[0]);
  let isOn = msg.includes("on");
  return [id, isOn];
}

async function response(id, target, auth, type, isOn) {
  await bot.sendMessage(
    id,
    `我已经开始${isOn} ${target} 的${auth}功能！`,
    type
  );
}

async function setFeedbackAuth(msg, id, type) {
  let [target, isOn] = parse(msg);
  await setAuth("feedback", target, isOn);
  await response(id, target, "带话", type, isOn ? "允许" : "禁止");
}

async function setMusicAuth(msg, id, type) {
  let [target, isOn] = parse(msg);
  await setAuth("music", target, isOn);
  await response(id, target, "点歌", type, isOn ? "允许" : "禁止");
}

async function setGachaAuth(msg, id, type) {
  let [target, isOn] = parse(msg);
  await setAuth("gacha", target, isOn);
  await response(id, target, "祈愿十连", type, isOn ? "允许" : "禁止");
}

async function setArtifactAuth(msg, id, type) {
  let [target, isOn] = parse(msg);
  await setAuth("artifact", target, isOn);
  await response(id, target, "抽取圣遗物", type, isOn ? "允许" : "禁止");
}

async function setRatingAuth(msg, id, type) {
  let [target, isOn] = parse(msg);
  await setAuth("rating", target, isOn);
  await response(id, target, "圣遗物评分", type, isOn ? "允许" : "禁止");
}

async function setQueryGameInfoAuth(msg, id, type) {
  let [target, isOn] = parse(msg);
  await setAuth("query", target, isOn);
  await response(id, target, "查询游戏内信息", type, isOn ? "允许" : "禁止");
}

async function setCharacterOverviewAuth(msg, id, type) {
  let [target, isOn] = parse(msg);
  await setAuth("overview", target, isOn);
  await response(id, target, "查询官方信息", type, isOn ? "允许" : "禁止");
}

async function setReplyAuth(msg, id, type) {
  let [target, isOn] = parse(msg);
  let list = new Map([...bot.fl, ...bot.gl]);

  await setAuth("reply", target, isOn);
  await response(id, target, "响应消息", type, isOn ? "允许" : "禁止");

  // 如果是群或者好友，发一条消息给对方，群友就不发了
  list.forEach(async (item) => {
    let itemID = item.hasOwnProperty("group_id") ? item.group_id : item.user_id;
    let curType = item.hasOwnProperty("group_id") ? "group" : "private";

    if (itemID == target) {
      await bot.sendMessage(
        target,
        `主人已${isOn ? "允许" : "禁止"}我响应消息。`,
        curType
      );
    }
  });
}

async function refreshWishDetail(id, type) {
  gachaUpdate();
  await bot.sendMessage(id, "卡池内容已刷新。", type);
}

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;

  if (!isMaster(userID)) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 不能使用管理命令。`,
      type
    );
    return;
  }

  switch (true) {
    case hasEntrance(msg, "master", "feedback_auth"):
      await setFeedbackAuth(msg, sendID, type);
      break;
    case hasEntrance(msg, "master", "music_auth"):
      await setMusicAuth(msg, sendID, type);
      break;
    case hasEntrance(msg, "master", "gacha_auth"):
      await setGachaAuth(msg, sendID, type);
      break;
    case hasEntrance(msg, "master", "artifact_auth"):
      await setArtifactAuth(msg, sendID, type);
      break;
    case hasEntrance(msg, "master", "rating_auth"):
      await setRatingAuth(msg, sendID, type);
      break;
    case hasEntrance(msg, "master", "query_gameinfo_auth"):
      await setQueryGameInfoAuth(msg, sendID, type);
      break;
    case hasEntrance(msg, "master", "character_overview_auth"):
      await setCharacterOverviewAuth(msg, sendID, type);
      break;
    case hasEntrance(msg, "master", "reply_auth"):
      await setReplyAuth(msg, sendID, type);
      break;
    case hasEntrance(msg, "master", "refresh_wish_detail"):
      await refreshWishDetail(sendID, type);
      break;
  }
}

export { Plugin as run };
