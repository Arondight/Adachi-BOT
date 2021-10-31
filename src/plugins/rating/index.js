/* global command */
/* eslint no-undef: "error" */

import lodash from "lodash";
import fetch from "node-fetch";
import { hasAuth, sendPrompt } from "../../utils/auth.js";

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
    bot.logger.debug(
      `评分：调整属性 ${type}：${item} （ ${before} -> ${after} ）`
    );

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
      let type =
        "atk" === obj.main_item.type
          ? "atk2"
          : "hp" === obj.main_item.type
          ? "hp2"
          : "em";

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
      item.value = `${(value / 10).toFixed(1).toString()}%`;
      say("副属性", item.type, before, item.value);
    }
  }

  return obj;
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const whisper = `【${command.functions.name.rating}】需要有一张背包中的圣遗物截图`;

  // 此命令和图片之间可以加任意个空格
  // https://github.com/Arondight/Adachi-BOT/issues/54
  const source = msg.match(/\[CQ:image,file=.+?\]/);
  const [url] = /(?<=url=).+(?=])/.exec(source) || [];
  const headers = {
    "Content-Type": "application/json",
  };
  let data, response, ret, prop;

  if (
    !(await hasAuth(userID, "rating")) ||
    !(await hasAuth(sendID, "rating"))
  ) {
    await sendPrompt(sendID, userID, name, "圣遗物评分", type, bot);
    return;
  }

  try {
    response = await fetch(url, { method: "GET" });
  } catch {
    await bot.sendMessage(
      sendID,
      `您看上去没有发送圣遗物属性截图，${whisper}。`,
      type,
      userID
    );
    return;
  }

  if (200 === response.status) {
    ret = await response.arrayBuffer();
    data = Buffer.from(ret).toString("base64");
  } else {
    await bot.sendMessage(
      sendID,
      "没有正确接收到截图，请再试一次。",
      type,
      userID
    );
    return;
  }

  const form = { image: data };
  let body = JSON.stringify(form);

  // { "name": "勋绩之花", "pos": "生之花", "star": 5, "level": 20,
  //   "main_item": { "type": "hp", "name": "生命值", "value": "4780" },
  //   "sub_item": [ { "type": "em", "name": "元素精通", "value": "23" },
  //                 { "type": "atk", "name": "攻击力", "value": "117%" },
  //                 { "type": "cr", "name": "暴击率", "value": "10.5" },
  //                 { "type": "cd", "name": "暴击伤害", "value": "14.0" }]}
  response = await fetch("https://api.genshin.pub/api/v1/app/ocr", {
    method: "POST",
    headers,
    body,
  });

  if (200 != response.status) {
    await bot.sendMessage(sendID, `AI 识别出错，${whisper}。`, type, userID);
    return;
  }

  ret = adjustProp(await response.json(), bot);
  body = JSON.stringify(ret);
  prop = ret;

  response = await fetch("https://api.genshin.pub/api/v1/relic/rate", {
    method: "POST",
    headers,
    body,
  });

  // { "total_score": 700.4420866489831, "total_percent": "77.83", "main_score": 0,
  //   "main_percent": "0.00", "sub_score": 700.4420866489831, "sub_percent": "77.83" }
  ret = await response.json();

  if (400 === response.status) {
    if (lodash.hasIn(ret, "code") && 50003 === ret.code) {
      await bot.sendMessage(
        sendID,
        "您上传了正确的截图，但是 AI 未能识别，请重新截图。",
        type,
        userID
      );
    } else {
      await bot.sendMessage(
        sendID,
        `圣遗物评分出错，${whisper}。`,
        type,
        userID
      );
    }

    return;
  }

  if (200 === response.status || lodash.hasIn(ret, "total_percent")) {
    data = `您的${prop.pos}（${prop.main_item.name}）评分为 ${ret.total_percent} 分！\n==========`;
    prop.sub_item.forEach((item) => {
      data += `\n${item.name}：${item.value}`;
    });

    await bot.sendMessage(sendID, data, type, userID);
    return;
  }

  await bot.sendMessage(
    sendID,
    "发生了一个未知错误，请再试一次。",
    type,
    userID
  );
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
