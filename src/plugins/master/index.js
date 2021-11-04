/* global all */
/* eslint no-undef: "error" */

import { gachaUpdate } from "../../utils/update.js";
import { setAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";

function parse(text, func) {
  const id = parseInt(text.match(/[0-9]+/g)[0]);
  const isOn = text.includes(all.functions.options[func].on);
  return [id, isOn];
}

async function response(id, target, auth, type, isOn, user, bot) {
  await bot.say(id, `我已经开始${isOn} ${target} 的${auth}功能！`, type, user);
}

async function setFeedbackAuth(text, id, type, user, bot) {
  const [target, isOn] = parse(text, "feedback_auth");
  await setAuth("feedback", target, isOn);
  await response(id, target, "带话", type, isOn ? "允许" : "禁止", user, bot);
}

async function setMusicAuth(text, id, type, user, bot) {
  const [target, isOn] = parse(text, "music_auth");
  await setAuth("music", target, isOn);
  await response(id, target, "点歌", type, isOn ? "允许" : "禁止", user, bot);
}

async function setGachaAuth(text, id, type, user, bot) {
  const [target, isOn] = parse(text, "gacha_auth");
  await setAuth("gacha", target, isOn);
  await response(id, target, "祈愿十连", type, isOn ? "允许" : "禁止", user, bot);
}

async function setArtifactAuth(text, id, type, user, bot) {
  const [target, isOn] = parse(text, "artifact_auth");
  await setAuth("artifact", target, isOn);
  await response(id, target, "抽取圣遗物", type, isOn ? "允许" : "禁止", user, bot);
}

async function setRatingAuth(text, id, type, user, bot) {
  const [target, isOn] = parse(text, "rating_auth");
  await setAuth("rating", target, isOn);
  await response(id, target, "圣遗物评分", type, isOn ? "允许" : "禁止", user, bot);
}

async function setQueryGameInfoAuth(text, id, type, user, bot) {
  const [target, isOn] = parse(text, "query_gameinfo_auth");
  await setAuth("query", target, isOn);
  await response(id, target, "查询游戏内信息", type, isOn ? "允许" : "禁止", user, bot);
}

async function setCharacterOverviewAuth(text, id, type, user, bot) {
  const [target, isOn] = parse(text, "character_overview_auth");
  await setAuth("overview", target, isOn);
  await response(id, target, "查询官方信息", type, isOn ? "允许" : "禁止", user, bot);
}

async function setReplyAuth(text, id, type, user, bot) {
  const [target, isOn] = parse(text, "reply_auth");
  const list = new Map([...bot.fl, ...bot.gl]);

  await setAuth("reply", target, isOn);
  await response(id, target, "响应消息", type, isOn ? "允许" : "禁止", user, bot);

  // 如果是群或者好友，发一条消息给对方，群友就不发了
  list.forEach(async (item) => {
    const curType = item.group_id ? "group" : "private";
    const itemID = item.group_id ? item.group_id : item.user_id;

    if (itemID == target) {
      // 群通知不需要 @
      await bot.say(target, `主人已${isOn ? "允许" : "禁止"}我响应消息。`, curType);
    }
  });
}

async function refreshWishDetail(id, type, user, bot) {
  gachaUpdate();
  await bot.say(id, "卡池内容已刷新。", type, user);
}

async function Plugin(msg, bot) {
  switch (true) {
    case hasEntrance(msg.text, "master", "feedback_auth"):
      await setFeedbackAuth(msg.text, msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "master", "music_auth"):
      await setMusicAuth(msg.text, msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "master", "gacha_auth"):
      await setGachaAuth(msg.text, msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "master", "artifact_auth"):
      await setArtifactAuth(msg.text, msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "master", "rating_auth"):
      await setRatingAuth(msg.text, msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "master", "query_gameinfo_auth"):
      await setQueryGameInfoAuth(msg.text, msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "master", "character_overview_auth"):
      await setCharacterOverviewAuth(msg.text, msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "master", "reply_auth"):
      await setReplyAuth(msg.text, msg.sid, msg.type, msg.uid, bot);
      break;
    case hasEntrance(msg.text, "master", "refresh_wish_detail"):
      await refreshWishDetail(msg.sid, msg.type, msg.uid, bot);
      break;
  }
}

export { Plugin as run };
