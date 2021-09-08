const fetch = require("node-fetch");
const { hasAuth, sendPrompt } = require("../../utils/auth");
const { hasKey } = require("../../utils/tools");

const doGet = async (url) => {
  const response = await fetch(url, { method: "GET" });
  return response;
};

const doPost = async (url, headers, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body,
  });

  return response;
};

module.exports = async (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
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
    response = await doGet(url);
  } catch {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 您看上去没有发送圣遗物属性截图，${whisper}。`,
      type
    );
    return;
  }

  if (response.status == 200) {
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
  response = await doPost(
    "https://api.genshin.pub/api/v1/app/ocr",
    headers,
    body
  );

  if (200 != response.status) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] AI 识别出错，${whisper}。`,
      type
    );
    return;
  }

  ret = await response.json();
  body = JSON.stringify(ret);
  prop = ret;

  response = await doPost(
    "https://api.genshin.pub/api/v1/relic/rate",
    headers,
    body
  );

  // { "total_score": 700.4420866489831, "total_percent": "77.83", "main_score": 0,
  //   "main_percent": "0.00", "sub_score": 700.4420866489831, "sub_percent": "77.83" }
  ret = await response.json();

  if (response.status == 400) {
    if (hasKey(ret, "code") && ret["code"] == 50003) {
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

  if (response.status == 200 || hasKey(ret, "total_percent")) {
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
};
