import lodash from "lodash";
import moment from "moment-timezone";
import { getGachaDetail, getGachaList } from "#utils/api";
import db from "#utils/database";

async function parseGachaData(gachaID) {
  let res;

  try {
    res = await getGachaDetail(gachaID);
  } catch (e) {
    return undefined;
  }

  const data = {
    gacha_type: parseInt(res.gacha_type),
    upFourStar: [],
    upFiveStar: [],
    nonUpFourStar: [],
    nonUpFiveStar: [],
    threeStar: [],
  };

  res.r4_prob_list.forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);

    if (el.is_up === 0) {
      data.nonUpFourStar.push(parsed);
    } else {
      data.upFourStar.push(parsed);
    }
  });
  res.r5_prob_list.forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);

    if (el.is_up === 0) {
      data.nonUpFiveStar.push(parsed);
    } else {
      data.upFiveStar.push(parsed);
    }
  });
  res.r3_prob_list.forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);
    data.threeStar.push(parsed);
  });

  return data;
}

async function gachaUpdate() {
  const data = {};
  let info;
  const current_time = moment().tz("Asia/Shanghai");

  try {
    info = await getGachaList();
  } catch (e) {
    return false;
  }

  if (lodash.hasIn(info, "data.list") && Array.isArray(info.data.list)) {
    for (const c of info.data.list) {
      const raw_gacha_data = await parseGachaData(c.gacha_id);
      if (undefined === raw_gacha_data.gacha_type) {
        return false;
      }
      if (current_time - moment(c.end_time).tz("Asia/Shanghai") < 0) {
        data[c.gacha_type] = raw_gacha_data;
      }
    }

    const indefinite = data[200] || {};
    const character = data[301] || {};
    const character2 = data[400] || {};
    const weapon = data[302] || {};
    const record = [indefinite, character2, character, weapon];
    db.set("gacha", "data", record);
    return true;
  }

  return false;
}

export { gachaUpdate };
