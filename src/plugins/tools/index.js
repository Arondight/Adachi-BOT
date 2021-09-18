import { boardcast } from "./boardcast.js";
import { count } from "./count.js";
import { feedback } from "./feedback.js";
import { help } from "./help.js";
import { master } from "./master.js";
import { reply } from "./reply.js";
import { roll } from "./roll.js";
import { search } from "./search.js";

async function Plugin(Message) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let groupName = type === "group" ? Message.group_name : undefined;

  switch (true) {
    case msg.startsWith("带个话"):
      feedback(sendID, name, msg, type, userID, groupName);
      break;
    case msg.startsWith("群广播") || msg.startsWith("好友广播"):
      boardcast(sendID, msg, type, userID);
      break;
    case msg.startsWith("回个话"):
      reply(sendID, msg, type, userID);
      break;
    case msg.startsWith("群列表") ||
      msg.startsWith("好友列表") ||
      msg.startsWith("查找列表"):
      search(sendID, msg, type, userID);
      break;
    case msg.startsWith("统计列表"):
      count(sendID, msg, type, userID);
      break;
    case msg.startsWith("管理"):
      master(sendID, type);
      break;
    case msg.toLowerCase().startsWith("roll".toLowerCase()):
      roll(sendID, name, msg, type, userID);
      break;
    case msg.toLowerCase().startsWith("help".toLowerCase()):
      help(sendID, type);
      break;
  }
}

export { Plugin as run };
