import { filterWordsByRegex } from "../../utils/tools.js";

function feedback(msg) {
  const info = filterWordsByRegex(msg.text, ...global.command.functions.entrance.feedback);
  const text = `我这就去给主人带个话！如果有重要的反馈和建议可以到这里留言哦：
https://github.com/Arondight/Adachi-BOT/issues`;
  const textMaster =
    (msg.sid == msg.uid ? "" : `${msg.group_name}（${msg.sid}）中的`) +
    `${msg.name}（${msg.uid}）给主人带个话：\n${info}`;

  // 私聊无法 @
  msg.bot.sayMaster(msg.sid, textMaster, msg.type, msg.uid);
  msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
}

export { feedback };
