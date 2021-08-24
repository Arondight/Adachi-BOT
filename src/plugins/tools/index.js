const roll = require("./roll");
const help = require("./help");
const feedback = require("./feedback");
const reply = require("./reply");
const boardcast = require("./boardcast");
const master = require("./master");

module.exports = (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;

  switch (true) {
    case msg.includes("带个话"):
      feedback(sendID, name, msg, type, userID);
      break;
    case msg.includes("群广播") || msg.includes("好友广播"):
      boardcast(sendID, msg, type);
      break;
    case msg.includes("回个话"):
      reply(sendID, msg, type);
      break;
    case msg.includes("roll"):
      roll(sendID, name, msg, type, userID);
      break;
    case msg.includes("help"):
      help(sendID, type);
      break;
    case msg.includes("管理"):
      master(sendID, type);
      break;
  }
};
