const { roll } = require("./roll");
const { help } = require("./help");
const { feedback } = require("./feedback");
const { reply } = require("./reply");
const { boardcast } = require("./boardcast");
const { master } = require("./master");
const { search } = require("./search");

module.exports = (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;

  switch (true) {
    case msg.startsWith("带个话"):
      feedback(sendID, name, msg, type, userID);
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
};
