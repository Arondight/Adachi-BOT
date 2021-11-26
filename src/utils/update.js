import lodash from "lodash";
import db from "./database.js";
import { getGachaDetail, getGachaList } from "./api.js";

async function parseData(gachaID) {
  const data = await getGachaDetail(gachaID);
  let detail = {
    gacha_type: parseInt(data.gacha_type),
    upFourStar: [],
    upFiveStar: [],
    nonUpFourStar: [],
    nonUpFiveStar: [],
    threeStar: [],
  };

  data.r4_prob_list.forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);

    if (el.is_up === 0) {
      detail.nonUpFourStar.push(parsed);
    } else {
      detail.upFourStar.push(parsed);
    }
  });
  data.r5_prob_list.forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);

    if (el.is_up === 0) {
      detail.nonUpFiveStar.push(parsed);
    } else {
      detail.upFiveStar.push(parsed);
    }
  });
  data.r3_prob_list.forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);
    detail.threeStar.push(parsed);
  });
  return detail;
}

async function gachaUpdate() {
  const info = await getGachaList();
  const data = {};

  if (lodash.hasIn(info, ["data", "list"]) && Array.isArray(info.data.list)) {
    for (const c of info.data.list) {
      data[c.gacha_type] = await parseData(c.gacha_id);
    }

    const indefinite = data[200];
    const character = data[301];
    const character2 = data[400];
    const weapon = data[302];

    db.set("gacha", "data", [indefinite, character2, character, weapon]);
    // 只打印一次日志
    global.bots.logger.debug("卡池：内容已刷新。");
  }
}

export { gachaUpdate };
