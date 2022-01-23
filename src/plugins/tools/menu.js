import { getRandomInt } from "../../utils/tools.js";

const { breakfast, lunch, dinner } = global.menu;

function menu(msg) {
  const food = "派蒙";
  const message = `今日的推荐菜单是：
早餐：${breakfast ? breakfast[getRandomInt(breakfast.length)] : food}
午餐：${lunch ? lunch[getRandomInt(lunch.length)] : food}
晚餐：${dinner ? dinner[getRandomInt(dinner.length)] : food}`;

  msg.bot.say(msg.sid, message, msg.type, msg.uid, true);
}

export { menu };
