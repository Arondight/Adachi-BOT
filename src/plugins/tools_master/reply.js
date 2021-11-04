async function reply(id, text, type, user, bot) {
  const target = parseInt(text.match(/[0-9]+/g)[0]);
  const [msg] = text.split(/(?<=\d+\S+)\s/).slice(1);
  const list = new Map([...bot.fl, ...bot.gl]);

  list.forEach(async (item) => {
    const curType = item.group_id ? "group" : "private";
    const itemID = "group" === curType ? item.group_id : item.user_id;

    if (itemID == target) {
      // 送话无法 @
      await bot.say(itemID, `主人让我送个话：\n${msg}`, curType);
      // 私聊无法 @
      await bot.say(id, `我已经给${itemID}送话了。`, "private");
    }
  });
}

export { reply };
