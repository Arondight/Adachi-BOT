import { getRandomInt } from "../../utils/tools.js";

const { breakfast, lunch, dinner } = global.menu;

function menu(msg) {
  const food = "派蒙";
  const message = `今日的推荐菜单是：
早餐：${breakfast ? breakfast[getRandomInt(breakfast.length) - 1] : food}
午餐：${lunch ? lunch[getRandomInt(lunch.length) - 1] : food}
晚餐：${dinner ? dinner[getRandomInt(dinner.length) - 1] : food}`;
  const eatMoreVegetable = message.match(/[煎炸炒烤油]/) ? "\n记得多吃蔬菜水果，不要上火哦。" : "";

  msg.bot.say(msg.sid, `${message}${eatMoreVegetable}`, msg.type, msg.uid, true);
}

export { menu };
