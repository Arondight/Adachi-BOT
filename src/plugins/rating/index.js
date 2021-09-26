import lodash from "lodash";
import fetch from "node-fetch";
import { hasAuth, sendPrompt } from "../../utils/auth.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;

  // 【评分】命令和图片之间可以加任意个空格
  // https://github.com/Arondight/Adachi-BOT/issues/54
  let [source] = msg.split(/^评分\s*/).slice(1);
  let [url] = /(?<=url=).+(?=])/.exec(source) || [];
  let headers = {
    "Content-Type": "application/json",
  };
  let data, response, ret, prop;
  const whisper = "【评分】需要有一张背包中的圣遗物截图（黄白背景）";

  if (
    !(await hasAuth(userID, "rating")) ||
    !(await hasAuth(sendID, "rating"))
  ) {
    await sendPrompt(sendID, userID, name, "圣遗物评分", type);
    return;
  }

  try {
    response = await fetch(url, { method: "GET" });
  } catch {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 您看上去没有发送圣遗物属性截图，${whisper}。`,
      type
    );
    return;
  }

  if (200 === response.status) {
    ret = await response.arrayBuffer();
    data = Buffer.from(ret).toString("base64");
  } else {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 没有正确接收到截图，请再试一次。`,
      type
    );
    return;
  }

  let form = { image: data };
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
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] AI 识别出错，${whisper}。`,
      type
    );
    return;
  }

  ret = await response.json();
  // 只调整带百分号的，因为不带百分号的不会出现小数点
  let maxValue = {
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

  for (let item_type of Object.keys(maxValue)) {
    if (!ret.hasOwnProperty(item_type)) {
      continue;
    }

    let main_item = "main_item" == item_type ? true : false;
    let items = main_item ? [ret[item_type]] : ret[item_type];

    for (let item of items) {
      if (!maxValue[item_type].hasOwnProperty(item["type"])) {
        continue;
      }

      if (!item["value"].includes("%")) {
        continue;
      }

      let value = parseInt(item["value"]);

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
        `[CQ:at,qq=${userID}] 你上传了正确的截图，但是 AI 未能正确识别，请重新截图。`,
        type
      );
    } else {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 圣遗物评分出错，${whisper}。`,
        type
      );
    }

    return;
  }

  if (200 === response.status || lodash.hasIn(ret, "total_percent")) {
    data = `[CQ:at,qq=${userID}] 您的${prop["pos"]}评分为 ${ret["total_percent"]} 分！
${prop["main_item"]["name"]}：${prop["main_item"]["value"]}
==========`;

    prop["sub_item"].forEach((item) => {
      data += `\n${item["name"]}：${item["value"]}`;
    });
    await bot.sendMessage(sendID, data, type);
    return;
  }

  await bot.sendMessage(
    sendID,
    `[CQ:at,qq=${userID}] 发生了一个未知错误，请再试一次。`,
    type
  );
}

export { Plugin as run };
