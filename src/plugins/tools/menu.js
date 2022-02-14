import { getRandomInt } from "#utils/tools";

function menu(msg) {
  const { eat, drink } = global.menu;
  const { breakfast, lunch, dinner, snack } = eat;
  const { base, topping, sweetness } = drink;
  const eatText = `今日的推荐菜单是：
早餐：${breakfast[getRandomInt(breakfast.length)] || ""}
午餐：${lunch[getRandomInt(lunch.length)] || ""}
晚餐：${dinner[getRandomInt(dinner.length)] || ""}
夜宵：${snack[getRandomInt(snack.length)] || ""}`;
  const baseText = base[getRandomInt(base.length)] || "水";
  const toppingText =
    Math.random() < 0.5 && baseText.endsWith("茶") ? `加${topping[getRandomInt(topping.length)] || "量"}的` : "";
  const sweetnessText = sweetness[getRandomInt(sweetness.length)] || "";
  const drinkText = `来一杯${sweetnessText}${toppingText}${baseText}！`;

  msg.bot.say(msg.sid, msg.text.includes("喝") ? drinkText : eatText, msg.type, msg.uid, true);
}

export { menu };
