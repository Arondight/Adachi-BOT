import { getRandomInt } from "../../utils/tools.js";
import { loadYML } from "../../utils/yaml.js";

const { breakfast, lunch, dinner } = config.menu;

async function Plugin(Message, bot) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let message = `今日的推荐菜单是：
早餐：${breakfast ? breakfast[getRandomInt(breakfast.length) - 1] : "派蒙"}
午餐：${lunch ? lunch[getRandomInt(lunch.length) - 1] : "派蒙"}
晚餐：${dinner ? dinner[getRandomInt(dinner.length) - 1] : "派蒙"}`;

  await bot.sendMessage(sendID, message, type, userID);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
