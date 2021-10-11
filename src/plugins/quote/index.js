import fetch from "node-fetch";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  };
  const response = await fetch("https://mao.coolrc.workers.dev/", {
    method: "POST",
    headers: headers,
  });

  if (200 === response.status) {
    const { quote, from } = await response.json();
    return await bot.sendMessage(sendID, `${quote}\n${from}`, type, userID);
  }

  await bot.sendMessage(sendID, "伟大的升华！", type, userID);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
