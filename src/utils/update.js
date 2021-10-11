/* global bots */
/* eslint no-undef: "error" */

import lodash from "lodash";
import db from "./database.js";
import { getGachaList, getGachaDetail } from "./api.js";

async function parseData(gachaID) {
  const data = await getGachaDetail(gachaID);
  let detail = {
    gacha_type: parseInt(data["gacha_type"]),
    upFourStar: [],
    upFiveStar: [],
    nonUpFourStar: [],
    nonUpFiveStar: [],
    threeStar: [],
  };

  data["r4_prob_list"].forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);

    if (el["is_up"] === 0) {
      detail.nonUpFourStar.push(parsed);
    } else {
      detail.upFourStar.push(parsed);
    }
  });
  data["r5_prob_list"].forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);

    if (el["is_up"] === 0) {
      detail.nonUpFiveStar.push(parsed);
    } else {
      detail.upFiveStar.push(parsed);
    }
  });
  data["r3_prob_list"].forEach((el) => {
    const parsed = lodash.pick(el, ["item_type", "item_name"]);
    detail.threeStar.push(parsed);
  });
  return detail;
}

async function gachaUpdate() {
  const gachaInfo = (await getGachaList()).data.list;

  if (undefined === gachaInfo[1]) {
    return;
  }

  const getGachaCode = (gachaID) => {
    const gacha = gachaInfo.filter((el) => el["gacha_type"] === gachaID);
    let maxTime = 0;
    let tmpGacha;

    for (const g of gacha) {
      const date = new Date(g["begin_time"]);

      if (date.getTime() > maxTime) {
        maxTime = date.getTime();
        tmpGacha = g;
      }
    }

    return tmpGacha["gacha_id"];
  };

  const indefinite = await parseData(gachaInfo[0]["gacha_id"]);
  const character = await parseData(getGachaCode(301));
  const weapon = await parseData(getGachaCode(302));

  await db.set("gacha", "data", [indefinite, character, weapon]);
  // 只打印一次日志
  bots[0] && bots[0].logger.debug("卡池：内容已刷新。");
}

export { gachaUpdate };
