import { hasAuth, sendPrompt } from "../../utils/auth.js";

async function feedback(id, uname, msg, type, user, gname) {
  let info = msg.slice(4);

  if (!(await hasAuth(id, "feedback")) || !(await hasAuth(id, "feedback"))) {
    await sendPrompt(id, uname, "带话", type);
  } else {
    await bot.sendMaster(
      id,
      (id == user ? "" : `${gname}（${id}）中的`) +
        `${uname}（${user}）给主人带个话：\n${info}`,
      type
    );
    await bot.sendMessage(
      id,
      `[CQ:at,qq=${user}] 我这就去给主人带个话！
如果有重要的反馈和建议可以到这里留言哦：
https://github.com/Arondight/Adachi-BOT/issues`,
      type
    );
  }
}

export { feedback };
