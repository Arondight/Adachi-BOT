import { getRandomInt } from "../../utils/tools";
import { loadYML } from "../../utils/load";
var module = {
  exports: {}
};
var exports = module.exports;
const menuCfg = loadYML("menu");
const {
  breakfast: breakfastMenu,
  lunch: lunchMenu,
  dinner: dinnerMenu
} = menuCfg;

module.exports = async Message => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let breakfastIdx = getRandomInt(breakfastMenu.length) - 1;
  let lunchIdx = getRandomInt(lunchMenu.length) - 1;
  let dinnerIdx = getRandomInt(dinnerMenu.length) - 1;
  let message = `为 [CQ:at,qq=${userID}] 推荐的今日菜单是：
早餐：${breakfastMenu[breakfastIdx]}
午餐：${lunchMenu[lunchIdx]}
晚餐：${dinnerMenu[dinnerIdx]}`;
  await bot.sendMessage(sendID, message, type);
};

export default module.exports;