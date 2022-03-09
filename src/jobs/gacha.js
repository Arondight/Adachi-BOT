import lodash from "lodash";
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

  try {
    info = await getGachaList();
  } catch (e) {
    return false;
  }

  if (lodash.hasIn(info, "data.list") && Array.isArray(info.data.list)) {
    const list = lodash
      .chain(info.data.list)
      .sortBy((c) => [c.gacha_type, new Date(c.begin_time).valueOf()])
      .reverse()
      .value();

    for (const c of list) {
      if (!lodash.hasIn(data, c.gacha_type)) {
        if (undefined === (data[c.gacha_type] = await parseGachaData(c.gacha_id))) {
          return false;
        }
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
