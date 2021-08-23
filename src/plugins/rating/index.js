const { hasAuth, sendPrompt } = require("../../utils/auth");
const fetch = require("node-fetch");

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

const hasKey = (obj, level, ...rest) => {
  if (obj === undefined) {
    return false;
  }
  if (rest.length == 0 && obj.hasOwnProperty(level)) {
    return true;
  }

  return hasKey(obj[level], ...rest);
};

module.exports = async (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let [source] = msg.split(/(?<=^\S+)\s/).slice(1);
  let [url] = /(?<=url=).+(?=])/.exec(source) || [];
  let headers = {
    "Content-Type": "application/json",
  };
  let data, response, ret;
  let whisper = "【评分】需要有一张背包中的圣遗物截图（黄白背景）";

  if (
    !(await hasAuth(userID, "rating")) ||
    !(await hasAuth(sendID, "rating"))
  ) {
    await sendPrompt(sendID, userID, name, "圣遗物评分", type);
    return;
  }

  if (!url) {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 您看上去没有发送圣遗物属性截图，${whisper}。`,
      type
    );
  }

  response = await doGet(url);

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

  response = await doPost(
    "https://api.genshin.pub/api/v1/relic/rate",
    headers,
    body
  );

  ret = await response.json();

  if (response.status == 200) {
    console.log(JSON.stringify(ret));
  } else if (response.status == 400) {
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
  } else {
    await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] 发生了一个未知错误，请再试一次。`,
      type
    );
  }
};
