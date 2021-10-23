/* global all */
/* eslint no-undef: "error" */

import { gachaUpdate } from "../../utils/update.js";
import { setAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";

function parse(msg, func) {
  const id = parseInt(msg.match(/[0-9]+/g)[0]);
  const isOn = msg.includes(all.functions.options[func].on);
  return [id, isOn];
}

async function response(id, target, auth, type, isOn, user, bot) {
  await bot.sendMessage(
    id,
    `我已经开始${isOn} ${target} 的${auth}功能！`,
    type,
    user
  );
}

async function setFeedbackAuth(msg, id, type, user, bot) {
  const [target, isOn] = parse(msg, "feedback_auth");
  await setAuth("feedback", target, isOn);
  await response(id, target, "带话", type, isOn ? "允许" : "禁止", user, bot);
}

async function setMusicAuth(msg, id, type, user, bot) {
  const [target, isOn] = parse(msg, "music_auth");
  await setAuth("music", target, isOn);
  await response(id, target, "点歌", type, isOn ? "允许" : "禁止", user, bot);
}

async function setGachaAuth(msg, id, type, user, bot) {
  const [target, isOn] = parse(msg, "gacha_auth");
  await setAuth("gacha", target, isOn);
  await response(
    id,
    target,
    "祈愿十连",
    type,
    isOn ? "允许" : "禁止",
    user,
    bot
  );
}

async function setArtifactAuth(msg, id, type, user, bot) {
  const [target, isOn] = parse(msg, "artifact_auth");
  await setAuth("artifact", target, isOn);
  await response(
    id,
    target,
    "抽取圣遗物",
    type,
    isOn ? "允许" : "禁止",
    user,
    bot
  );
}

async function setRatingAuth(msg, id, type, user, bot) {
  const [target, isOn] = parse(msg, "rating_auth");
  await setAuth("rating", target, isOn);
  await response(
    id,
    target,
    "圣遗物评分",
    type,
    isOn ? "允许" : "禁止",
    user,
    bot
  );
}

async function setQueryGameInfoAuth(msg, id, type, user, bot) {
  const [target, isOn] = parse(msg, "query_gameinfo_auth");
  await setAuth("query", target, isOn);
  await response(
    id,
    target,
    "查询游戏内信息",
    type,
    isOn ? "允许" : "禁止",
    user,
    bot
  );
}

async function setCharacterOverviewAuth(msg, id, type, user, bot) {
  const [target, isOn] = parse(msg, "character_overview_auth");
  await setAuth("overview", target, isOn);
  await response(
    id,
    target,
    "查询官方信息",
    type,
    isOn ? "允许" : "禁止",
    user,
    bot
  );
}

async function setReplyAuth(msg, id, type, user, bot) {
  const [target, isOn] = parse(msg, "reply_auth");
  const list = new Map([...bot.fl, ...bot.gl]);

  await setAuth("reply", target, isOn);
  await response(
    id,
    target,
    "响应消息",
    type,
    isOn ? "允许" : "禁止",
    user,
    bot
  );

  // 如果是群或者好友，发一条消息给对方，群友就不发了
  list.forEach(async (item) => {
    const curType = item.group_id ? "group" : "private";
    const itemID = item.group_id ? item.group_id : item.user_id;

    if (itemID == target) {
      // 群通知不需要 @
      await bot.sendMessage(
        target,
        `主人已${isOn ? "允许" : "禁止"}我响应消息。`,
        curType
      );
    }
  });
}

async function refreshWishDetail(id, type, user, bot) {
  gachaUpdate();
  await bot.sendMessage(id, "卡池内容已刷新。", type, user);
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;

  switch (true) {
    case hasEntrance(msg, "master", "feedback_auth"):
      await setFeedbackAuth(msg, sendID, type, userID, bot);
      break;
    case hasEntrance(msg, "master", "music_auth"):
      await setMusicAuth(msg, sendID, type, userID, bot);
      break;
    case hasEntrance(msg, "master", "gacha_auth"):
      await setGachaAuth(msg, sendID, type, userID, bot);
      break;
    case hasEntrance(msg, "master", "artifact_auth"):
      await setArtifactAuth(msg, sendID, type, userID, bot);
      break;
    case hasEntrance(msg, "master", "rating_auth"):
      await setRatingAuth(msg, sendID, type, userID, bot);
      break;
    case hasEntrance(msg, "master", "query_gameinfo_auth"):
      await setQueryGameInfoAuth(msg, sendID, type, userID, bot);
      break;
    case hasEntrance(msg, "master", "character_overview_auth"):
      await setCharacterOverviewAuth(msg, sendID, type, userID, bot);
      break;
    case hasEntrance(msg, "master", "reply_auth"):
      await setReplyAuth(msg, sendID, type, userID, bot);
      break;
    case hasEntrance(msg, "master", "refresh_wish_detail"):
      await refreshWishDetail(sendID, type, userID, bot);
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
