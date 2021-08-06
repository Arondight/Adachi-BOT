const { hasAuth, sendPrompt } = require("../../utils/auth");

module.exports = async (id, name, msg, type, user) => {
  let info = msg.slice(4);

  if (!(await hasAuth(id, "feedback")) || !(await hasAuth(id, "feedback"))) {
    await sendPrompt(id, name, "带话", type);
  } else {
    await bot.sendMaster(
      id,
      `${name}(${user}) 托我给您带个话：\n${info}`,
      type
    );
    await bot.sendMessage(
      id,
      `[CQ:at,qq=${user}] 我这就去给主人带个话！`,
      type
    );
  }
};
