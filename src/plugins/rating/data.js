import fetch from "node-fetch";
import { findIndexOf } from "#plugins/rating/findIndexOf";

function adjustProp(obj, bot) {
  function log(type, item, before, after) {
    bot.logger.debug(`评分：调整属性 ${type}：${item} （ ${before} -> ${after} ）`);
  }

  const level = 20;
  const star = 5;

  // 等级设置为 20
  if (level !== obj.level) {
    log("等级", "level", obj.level, level);
    obj.level = level;
  }

  // 星级设置为 5
  if (star !== obj.star) {
    log("星级", "star", obj.star, star);
    obj.star = star;
  }

  // 主属性直接设置为最大值
  const [index] = findIndexOf(obj.main_item);

  if ("number" === typeof index) {
    if (parseFloat(global.artifacts.props[index].mainValues[1]) !== parseFloat(obj.main_item.value)) {
      const before = obj.main_item.value;

      obj.main_item.value = global.artifacts.props[index].mainValues[1];
      log("主属性", obj.main_item.type, before, obj.main_item.value);
    }
  }

  // 试图调整百分比副词条中丢失小数点的条目
  for (const item of obj.sub_item || []) {
    const [index, percentage] = findIndexOf(item);

    if ("number" !== typeof index || !percentage) {
      continue;
    }

    const value = parseFloat(item.value);

    // 这里不需要循环调整，因为游戏内至多显示一位小数点
    if (value > parseFloat(global.artifacts.props[index].subValues[1]).toFixed(1)) {
      const before = item.value;

      item.value = `${(value / 10).toFixed(1)}%`;
      log("副属性", item.type, before, item.value);
    }
  }

  return obj;
}

// { "name": "勋绩之花", "pos": "生之花", "star": 5, "level": 20,
//   "main_item": { "type": "hp", "name": "生命值", "value": "4780" },
//   "sub_item": [ { "type": "em", "name": "元素精通", "value": "23" },
//                 { "type": "atk", "name": "攻击力", "value": "117%" },
//                 { "type": "cr", "name": "暴击率", "value": "10.5" },
//                 { "type": "cd", "name": "暴击伤害", "value": "14.0" }]}
async function imageOcr(msg, url) {
  const headers = {
    "Content-Type": "application/json",
  };
  let data, response;

  try {
    response = await fetch(url, { method: "GET" });
  } catch {
    msg.bot.say(msg.sid, `您看上去没有发送正确的圣遗物属性截图。`, msg.type, msg.uid, true);
    return undefined;
  }

  if (200 === response.status) {
    data = Buffer.from(await response.arrayBuffer()).toString("base64");
  } else {
    msg.bot.say(msg.sid, "没有正确接收到截图，请再试一次。", msg.type, msg.uid, true);
    return undefined;
  }

  const form = { image: data };
  let body = JSON.stringify(form);

  try {
    response = await fetch("https://api.genshin.pub/api/v1/app/ocr", {
      method: "POST",
      headers,
      body,
    });
  } catch (e) {
    msg.bot.say(msg.sid, `AI 识别出错。`, msg.type, msg.uid, true);
  }

  if (200 !== response.status) {
    msg.bot.say(msg.sid, `AI 识别出错。`, msg.type, msg.uid, true);
    return undefined;
  }

  return adjustProp(await response.json(), msg.bot);
}

export { imageOcr };
