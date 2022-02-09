import { getRandomInt } from "../../utils/tools.js";

function menu(msg) {
  const { eat, drink } = global.menu;
  const { breakfast, lunch, dinner, snack } = eat;
  const { base, topping, sweetness } = drink;
  const eatStr = `今日的推荐菜单是：
早餐：${breakfast[getRandomInt(breakfast.length)] || ""}
午餐：${lunch[getRandomInt(lunch.length)] || ""}
晚餐：${dinner[getRandomInt(dinner.length)] || ""}
夜宵：${snack[getRandomInt(snack.length)] || ""}`;
  const baseStr = base[getRandomInt(base.length)] || "水";
  const drinkStr = `来一杯${sweetness[getRandomInt(sweetness.length)] || ""}${
    baseStr.endsWith("茶") ? "加" + (topping[getRandomInt(topping.length)] || "量") : ""
  }${baseStr}！`;

  msg.bot.say(msg.sid, msg.text.includes("喝") ? drinkStr : eatStr, msg.type, msg.uid, true);
}

export { menu };
