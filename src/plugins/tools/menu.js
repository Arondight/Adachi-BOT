/* global config */
/* eslint no-undef: "error" */

import { getRandomInt } from "../../utils/tools.js";

const { breakfast, lunch, dinner } = config.menu;

async function menu(id, text, type, user, bot) {
  const favFood = "派蒙";
  const message = `今日的推荐菜单是：
早餐：${breakfast ? breakfast[getRandomInt(breakfast.length) - 1] : favFood}
午餐：${lunch ? lunch[getRandomInt(lunch.length) - 1] : favFood}
晚餐：${dinner ? dinner[getRandomInt(dinner.length) - 1] : favFood}`;

  await bot.say(id, message, type, user);
}

export { menu };
