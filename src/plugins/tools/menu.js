import { getRandomInt } from "../../utils/tools.js";

const { breakfast, lunch, dinner, snack, common, base, topping, sweetness } = global.menu;

function menu(msg) {
  const isValidBreakfast = Array.isArray(breakfast) && breakfast.length > 0,
    isValidLunch = Array.isArray(lunch) && lunch.length > 0,
    isValidCommon = Array.isArray(common) && common.length > 0,
    isValidDinner = Array.isArray(dinner) && dinner.length > 0,
    isValidSnack = Array.isArray(snack) && snack.length > 0,
    isValidBase = Array.isArray(base) && base.length > 0,
    isValidTopping = Array.isArray(topping) && topping.length > 0,
    isValidSweetness = Array.isArray(sweetness) && sweetness.length > 0;

  const breakfastMenu = breakfast,
    lunchMenu = isValidCommon ? lunch.concat(common) : lunch,
    dinnerMenu = isValidCommon ? dinner.concat(common) : dinner;

  function doSelectEat() {
    const food = "派蒙";
    const menuContent = `今日的推荐菜单是：
早餐：${isValidBreakfast ? breakfastMenu[getRandomInt(breakfastMenu.length)] : food}
午餐：${isValidLunch ? lunchMenu[getRandomInt(lunchMenu.length)] : food}
晚餐：${isValidDinner ? dinnerMenu[getRandomInt(dinnerMenu.length)] : food}`;
    const afternoonTea = Math.random() < 0.5;
    const midnightSnack = Math.random() < 0.5;
    const afternoonMenu = afternoonTea ? `\n下午茶：${isValidSnack ? snack[getRandomInt(snack.length)] : food}` : "";
    const snackMenu = midnightSnack ? `\n夜宵：${isValidSnack ? snack[getRandomInt(snack.length)] : food}` : "";
    return menuContent + afternoonMenu + snackMenu;
  }

  function doSelectDrink() {
    const drink = "水";
    const drinkBase = isValidBase ? base[getRandomInt(base.length)] : drink;
    const drinkTopping = drinkBase.endsWith("奶茶")
      ? isValidTopping
        ? `，加${topping[getRandomInt(topping.length)]}`
        : "，不加料"
      : "";
    const drinkSweetness = isValidSweetness ? "，" + sweetness[getRandomInt(sweetness.length)] : "，三分糖";
    return `今日的推荐饮品是：${drinkBase}${drinkTopping}${drinkSweetness}`;
  }

  let message;

  switch (msg) {
    case msg.text.endsWith("吃什么"):
      message = doSelectEat();
      break;
    case msg.text.endsWith("喝什么"):
      message = doSelectDrink();
      break;
    default:
      message = "今日的推荐菜品是：\n早餐：派蒙\n午餐：派蒙\n晚餐：派蒙";
      break;
  }

  msg.bot.say(msg.sid, message, msg.type, msg.uid, true);
}

export { menu };
