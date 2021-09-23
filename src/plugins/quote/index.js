import fetch from "node-fetch";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  };
  const response = await fetch("https://mao.coolrc.workers.dev/", {
    method: "POST",
    headers: headers,
  });

  if (response.status == 200) {
    let { quote, from } = await response.json();
    return await bot.sendMessage(
      sendID,
      `[CQ:at,qq=${userID}] ${quote}\n${from}`,
      type
    );
  }

  await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] 伟大的升华！`, type);
}

export { Plugin as run };
