import fetch from "node-fetch";

async function prophecy(msg) {
  const seed = Math.round(Date.now() / 1000);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  };
  const response = await fetch(`https://api.fanlisky.cn/api/qr-fortune/get/${seed}`, {
    method: "GET",
    headers: headers,
  });

  if (200 === response.status) {
    const { data } = await response.json();
    const { fortuneSummary, signText, unSignText } = data || {};
    const message = `${fortuneSummary}：${signText}。\n${unSignText}`;

    msg.bot.say(msg.sid, message, msg.type, msg.uid, true, "\n");
    return;
  }

  msg.bot.say(msg.sid, "今日星光黯淡，不宜求签……", msg.type, msg.uid, true);
}

export { prophecy };
