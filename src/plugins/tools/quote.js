import fetch from "node-fetch";

async function quote(id, msg, type, user, bot) {
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
    return await bot.sendMessage(id, `${quote}\n${from}`, type, user, "\n");
  }

  await bot.sendMessage(id, "伟大的升华！", type, user);
}

export { quote };
