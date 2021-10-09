async function reply(id, msg, type, user, bot) {
  let target = parseInt(msg.match(/[0-9]+/g)[0]);
  let [text] = msg.split(/(?<=\d+\S+)\s/).slice(1);
  let list = new Map([...bot.fl, ...bot.gl]);

  list.forEach(async (item, type) => {
    const curType = item.hasOwnProperty("group_id") ? "group" : "private";
    const itemID = "group" === curType ? item.group_id : item.user_id;

    if (itemID == target) {
      // 送话无法 @
      await bot.sendMessage(itemID, `主人让我送个话：\n${text}`, curType);
      // 私聊无法 @
      await bot.sendMessage(id, `我已经给${itemID}送话了。`, "private");
    }
  });
}

export { reply };
