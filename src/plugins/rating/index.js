/* global command */
/* eslint no-undef: "error" */

import lodash from "lodash";
import fetch from "node-fetch";
import { hasAuth, sendPrompt } from "../../utils/auth.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const whisper = `【${command.functions.entrance.rating[0]}】需要有一张背包中的圣遗物截图`;

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

  ret = await response.json();
  // 只调整带百分号的，因为不带百分号的不会出现小数点
  const maxValue = {
    main_item: {
      atk: "46.6", // 大攻击
      hp: "46.6", // 大生命
      df: "58.3", // 大防御
      er: "51.8", // 充能
      cr: "31.1", // 暴击率
      cd: "62.6", // 暴击伤害
      phys: "58.3", // 物伤
      anemo: "46.6", // 风伤
      geo: "46.6", // 岩伤
      cryo: "46.6", // 冰伤
      hydro: "46.6", // 水伤
      elec: "46.6", // 雷伤
      pyro: "46.6", // 火伤
      heal: "35.9", // 治疗
    },
    sub_item: {
      atk: "35.0", // 大攻击
      hp: "35.0", // 大生命
      df: "43.7", // 大防御
      er: "38.9", // 充能
      cr: "23.3", // 暴击率
      cd: "46.6", // 暴击伤害
    },
  };

  for (const item_type of Object.keys(maxValue)) {
    if (!ret[item_type]) {
      continue;
    }

    const main_item = "main_item" == item_type ? true : false;
    const items = main_item ? [ret[item_type]] : ret[item_type];

    for (let item of items) {
      if (!maxValue[item_type][item["type"]]) {
        continue;
      }

      if (!item["value"].includes("%")) {
        continue;
      }

      const value = parseInt(item["value"]);

      if (value > maxValue[item_type][item["type"]]) {
        let text = `评分：调整属性 ${item_type}:${item["type"]} (${item["value"]}`;
        item["value"] = (value / 10).toFixed(1).toString() + "%";
        text += ` -> ${item["value"]})`;
        bot.logger.debug(text);
      }
    }

    if (main_item) {
      ret[item_type] = items[0];
    }
  }

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
    if (lodash.hasIn(ret, "code") && 50003 === ret["code"]) {
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
    data = `您的${prop["pos"]}评分为 ${ret["total_percent"]} 分！
${prop["main_item"]["name"]}：${prop["main_item"]["value"]}
==========`;

    prop["sub_item"].forEach((item) => {
      data += `\n${item["name"]}：${item["value"]}`;
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
