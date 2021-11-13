/* global eggs, rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import path from "path";
import lodash from "lodash";
import db from "../../utils/database.js";

const configdir = path.resolve(rootdir, "resources", "Version2", "wish", "config");
const element = JSON.parse(fs.readFileSync(path.resolve(configdir, "character.json")));
const types = JSON.parse(fs.readFileSync(path.resolve(configdir, "weapon.json")));

function getRandomInt(max = 10000) {
  return Math.floor(Math.random() * max) + 1;
}

function getChoiceData(userID, choice = 301) {
  const { indefinite, character, weapon } = db.get("gacha", "user", { userID }) || {};

  switch (choice) {
    case 200:
      return { name: "indefinite", ...indefinite };
    case 301:
      return { name: "character", ...character };
    case 302:
      return { name: "weapon", ...weapon };
    case 999:
      return {
        name: "eggs",
        five: undefined,
        four: undefined,
        isUp: undefined,
      };
  }
}

let name, five, four, isUp;

// 数据参考: https://www.bilibili.com/read/cv10468091
// 更新时间: 2021年6月16日15:57:34, 不保证概率更新的及时性
function getFiveProb(counter, choice) {
  if (200 === choice || 301 === choice) {
    return 60 + 600 * (counter > 73 ? counter - 73 : 0);
  } else {
    if (counter < 63) {
      return 70;
    } else if (counter < 74) {
      return 70 + 700 * (counter > 62 ? counter - 62 : 0);
    } else {
      return 7770 + 350 * (counter - 73);
    }
  }
}

function getFourProb(counter, choice) {
  if (200 === choice || 301 === choice) {
    return 510 + 5100 * (counter > 8 ? counter - 8 : 0);
  } else {
    if (counter < 8) {
      return 600;
    } else if (8 === counter) {
      return 6600;
    } else {
      return 6600 + 3000 * (counter - 8);
    }
  }
}

function updateCounter(userID, star, up) {
  if (star !== 5) {
    five = five + 1;
    four = 4 === star ? 1 : four + 1; // 重置四星抽数
  } else if (isUp !== undefined && isUp !== null) {
    five = 1; // 重置五星抽数
    four = four + 1;
    isUp = up ? (isUp > 0 ? isUp + 1 : 1) : isUp > 0 ? -1 : isUp - 1;
  } else {
    five = 1;
    four = four + 1;
  }
}

function getIsUp(userID, star) {
  switch (isUp) {
    case null:
      return getRandomInt() <= 7500;
    case undefined:
      return false;
    default:
      return getRandomInt() <= 5000 || (5 === star && isUp < 0);
  }
}

function getStar(userID, choice) {
  const value = getRandomInt();
  const fiveProb = getFiveProb(five, choice);
  const fourProb = getFourProb(four, choice) + fiveProb;

  switch (true) {
    case value <= fiveProb:
      return 5;
    case value <= fourProb:
      return 4;
    default:
      return 3;
  }
}

function gachaOnceEggs() {
  const keys = Object.keys(eggs.type);
  const index = getRandomInt(keys.length) - 1;
  const name = keys[index];

  return {
    ...{ item_type: eggs.type[name] || "角色", item_name: name || "刻晴" },
    star: eggs.star[name] || 5,
    times: 1,
  };
}

function gachaOnce(userID, choice, table) {
  const star = getStar(userID, choice);
  const up = getIsUp(userID, star);
  const times = five;
  let { path } = db.get("gacha", "user", { userID }) || {};
  let result;

  // 彩蛋卡池不写入数据库
  if (999 === choice) {
    return gachaOnceEggs();
  }

  updateCounter(userID, star, up);

  if (5 === star && 302 === choice) {
    // 武器池出货
    if (null !== path.course && path.fate > 1) {
      // 定轨武器已设置并触发定轨
      result = table.upFiveStar[path.course];
      path.fate = 0;
      db.update("gacha", "user", { userID }, { path });
    } else {
      // 无定轨，或未触发定轨
      if (up) {
        const index = getRandomInt(table.upFiveStar.length) - 1;
        result = table.upFiveStar[index];
        path.fate = index === path.course ? 0 : path.fate + 1;
        db.update("gacha", "user", { userID }, { path });
      } else {
        const index = getRandomInt(table.nonUpFiveStar.length) - 1;
        result = table.nonUpFiveStar[index];
        path.fate++;
      }
    }

    return { ...result, star: 5, times };
  }

  if (5 === star) {
    // 限定池和普池出货
    if (up) {
      const index = getRandomInt(table.upFiveStar.length) - 1;
      result = table.upFiveStar[index];
    } else {
      const index = getRandomInt(table.nonUpFiveStar.length) - 1;
      result = table.nonUpFiveStar[index];
    }

    return { ...result, star: 5, times };
  } else if (4 === star) {
    // 没出货：四星
    if (up) {
      const index = getRandomInt(table.upFourStar.length) - 1;
      result = table.upFourStar[index];
    } else {
      const index = getRandomInt(table.nonUpFourStar.length) - 1;
      result = table.nonUpFourStar[index];
    }

    return { ...result, star: 4 };
  } else {
    // 没出货：三星
    const index = getRandomInt(table.threeStar.length) - 1;
    result = table.threeStar[index];
    return { ...result, star: 3 };
  }
}

function gachaTimes(userID, nickname, times = 10) {
  const { choice: uchoice } = db.get("gacha", "user", { userID }) || {};
  const choice = uchoice ? uchoice : 301;
  const gachaTable = db.get("gacha", "data", { gacha_type: choice }) || {};
  let gachaResults = [];
  let data = {};

  if (!uchoice) {
    db.update("gacha", "user", { userID }, { choice });
  }

  ({ name, five, four, isUp } = getChoiceData(userID, choice));

  for (let i = 0; i < times; ++i) {
    gachaResults.push(gachaOnce(userID, choice, gachaTable));
  }

  let result = {
    type: name,
    user: nickname,
    data: [],
    count: [],
    five: [],
    names: { five: [], four: [], three: [] },
    name_nums: { five: 0, four: 0, three: 0 },
    item_nums: { five: 0, four: 0, three: 0 },
  };

  gachaResults.forEach((c) => {
    c.type = ("武器" === c.item_type ? types : element)[c.item_name];
    result.data.push(c);
  });

  // 增加统计信息
  const byStar = {
    five: lodash.filter(result.data, { star: 5 }),
    four: lodash.filter(result.data, { star: 4 }),
    three: lodash.filter(result.data, { star: 3 }),
  };

  result.names.five = lodash.keys(lodash.keyBy(byStar.five, "item_name"));
  result.names.four = lodash.keys(lodash.keyBy(byStar.four, "item_name"));
  result.names.three = lodash.keys(lodash.keyBy(byStar.three, "item_name"));
  result.name_nums.five = result.names.five.length;
  result.name_nums.four = result.names.four.length;
  result.name_nums.three = result.names.three.length;
  result.item_nums.five = byStar.five.length;
  result.item_nums.four = byStar.four.length;
  result.item_nums.three = byStar.three.length;
  lodash.each(byStar.five, (c) => result.five.push(c));
  lodash
    .chain(result.data)
    .keyBy("item_name")
    .keys()
    .each((c) => {
      const a = lodash.filter(result.data, { item_name: c });
      result.count.push(lodash.omit({ ...a[0], ...{ count: a.length } }, "times"));
    })
    .value();

  // 彩蛋卡池不写入数据库
  if (999 !== choice) {
    data[name] = { five, four, isUp };
    db.update("gacha", "user", { userID }, data);
  }

  return result;
}

export { gachaTimes };
