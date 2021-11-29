import lodash from "lodash";
import db from "./database.js";
import { getGachaDetail, getGachaList } from "./api.js";

async function parseData(gachaID) {
  let data;

  try {
    data = await getGachaDetail(gachaID);
  } catch (e) {
    return undefined;
  }

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
  const data = {};
  let info;

  try {
    info = await getGachaList();
  } catch (e) {
    return false;
  }

  if (lodash.hasIn(info, ["data", "list"]) && Array.isArray(info.data.list)) {
    for (const c of info.data.list) {
      if (undefined === (data[c.gacha_type] = await parseData(c.gacha_id))) {
        return false;
      }
    }

    const indefinite = data[200];
    const character = data[301];
    const character2 = data[400];
    const weapon = data[302];
    const record = [indefinite, character2, character, weapon];

    for (const c of record) {
      if (undefined === c) {
        return false;
      }
    }

    db.set("gacha", "data", record);
    global.bots.logger.debug("卡池：内容已刷新。");
    return true;
  }

  return false;
}

export { gachaUpdate };
