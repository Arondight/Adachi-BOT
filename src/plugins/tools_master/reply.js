async function reply(msg) {
  const target = parseInt(msg.text.match(/[0-9]+/g)[0]);
  const [text] = msg.text.split(/(?<=\d+\S+)\s/).slice(1);
  const list = new Map([...msg.bot.fl, ...msg.bot.gl]);

  list.forEach(async (item) => {
    const curType = item.group_id ? "group" : "private";
    const itemID = "group" === curType ? item.group_id : item.user_id;

    if (itemID == target) {
      // 送话无法 @
      await msg.bot.say(itemID, `主人让我送个话：\n${text}`, curType);
      // 私聊无法 @
      await msg.bot.say(msg.sid, `我已经给${itemID}送话了。`, "private");
    }
  });
}

export { reply };
