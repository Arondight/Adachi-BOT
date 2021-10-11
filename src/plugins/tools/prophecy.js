import fetch from "node-fetch";

async function prophecy(id, name, msg, type, user, bot) {
  let headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  };

  const response = await fetch(
    `https://api.fanlisky.cn/api/qr-fortune/get/${id}`,
    {
      method: "GET",
      headers: headers,
    }
  );

  if (200 === response.status) {
    const { data } = await response.json();
    const { fortuneSummary, signText, unSignText } = (data || {});

    await bot.sendMessage(
      id,
      `${fortuneSummary}：${signText}。\n${unSignText}`,
      type,
      user
    );
    return;
  }

  await bot.sendMessage(id, "今日星光黯淡，不宜求签……", type, user);
}

export { prophecy };
