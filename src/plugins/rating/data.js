import fetch from "node-fetch";

function adjustProp(obj, bot) {
  const maxValue = {
    main_item: {
      // 主属性直接设置为最大值
      atk: 46.6, // 大攻击
      hp: 46.6, // 大生命
      df: 58.3, // 大防御
      er: 51.8, // 充能
      cr: 31.1, // 暴击率
      cd: 62.6, // 暴击伤害
      phys: 58.3, // 物伤
      anemo: 46.6, // 风伤
      geo: 46.6, // 岩伤
      cryo: 46.6, // 冰伤
      hydro: 46.6, // 水伤
      elec: 46.6, // 雷伤
      pyro: 46.6, // 火伤
      heal: 35.9, // 治疗
      em: 187, // 元素精通
      atk2: 311, // 小攻击
      hp2: 4780, // 小生命
    },
    sub_item: {
      // 副属性只调整带百分号的，因为不带百分号的不会出现小数点
      atk: 35.0, // 大攻击
      hp: 35.0, // 大生命
      df: 43.7, // 大防御
      er: 38.9, // 充能
      cr: 23.3, // 暴击率
      cd: 46.6, // 暴击伤害
    },
  };
  const level = 20;
  const star = 5;
  const say = (type, item, before, after) =>
    bot.logger.debug(`评分：调整属性 ${type}：${item} （ ${before} -> ${after} ）`);

  // 等级设置为 20
  if (level !== obj.level) {
    say("等级", "level", obj.level, level);
    obj.level = level;
  }

  // 星级设置为 5
  if (star !== obj.star) {
    say("星级", "star", obj.star, star);
    obj.star = star;
  }

  // 主属性直接设置为最大值
  if (maxValue.main_item[obj.main_item.type]) {
    const value = parseFloat(obj.main_item.value);

    if (obj.main_item.value.includes("%")) {
      if (value > maxValue.main_item[obj.main_item.type]) {
        const before = obj.main_item.value;
        obj.main_item.value = `${maxValue.main_item[obj.main_item.type]}%`;
        say("主属性", obj.main_item.type, before, obj.main_item.value);
      }
    } else {
      let type = "atk" === obj.main_item.type ? "atk2" : "hp" === obj.main_item.type ? "hp2" : "em";

      if (value !== maxValue.main_item[type]) {
        const before = obj.main_item.value;
        obj.main_item.value = `${maxValue.main_item[type]}`;
        say("主属性", obj.main_item.type, before, obj.main_item.value);
      }
    }
  }

  // 试图调整副词条中丢失小数点的条目
  for (const item of obj.sub_item || []) {
    if (!maxValue.sub_item[item.type] || !item.value.includes("%")) {
      continue;
    }

    const value = parseFloat(item.value);

    if (value > maxValue.sub_item[item.type]) {
      const before = item.value;
      item.value = `${(value / 10).toFixed(1)}%`;
      say("副属性", item.type, before, item.value);
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
async function imageOrc(msg, url) {
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

  response = await fetch("https://api.genshin.pub/api/v1/app/ocr", {
    method: "POST",
    headers,
    body,
  });

  if (200 != response.status) {
    msg.bot.say(msg.sid, `AI 识别出错。`, msg.type, msg.uid, true);
    return undefined;
  }

  return adjustProp(await response.json(), msg.bot);
}

export { imageOrc };
