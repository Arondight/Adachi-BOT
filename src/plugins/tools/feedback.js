import { hasAuth, sayAuth } from "../../utils/auth.js";

async function feedback(id, uname, text, type, user, gname, bot) {
  const info = text.split(/(?<=^\S+)\s/).slice(1);

  if (!(await hasAuth(id, "feedback")) || !(await hasAuth(user, "feedback"))) {
    await sayAuth(id, user, uname, "带话", type, bot);
  } else {
    // 私聊无法 @
    await bot.sayMaster(
      id,
      (id == user ? "" : `${gname}（${id}）中的`) + `${uname}（${user}）给主人带个话：\n${info}`,
      type,
      user
    );
    await bot.say(
      id,
      `我这就去给主人带个话！如果有重要的反馈和建议可以到这里留言哦：
https://github.com/Arondight/Adachi-BOT/issues`,
      type,
      user
    );
  }
}

export { feedback };
