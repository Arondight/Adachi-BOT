import fetch from "node-fetch";

async function Plugin(Message, bot) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  };

  const response = await fetch(
    `https://api.fanlisky.cn/api/qr-fortune/get/${userID}`,
    {
      method: "GET",
      headers: headers,
    }
  );

  if (200 === response.status) {
    let { data } = await response.json();
    let { fortuneSummary, signText, unSignText } = data;
    return await bot.sendMessage(
      sendID,
      `莫娜为你求得一签：\n综合运势：【${fortuneSummary}】\n${signText}\n${unSignText}`,
      type,
      userID
    );
  }

  await bot.sendMessage(
    sendID,
    "今日星光黯淡，莫娜无法为你占星求运唔QwQ",
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
