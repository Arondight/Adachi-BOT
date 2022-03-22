import fs from "fs";
import lodash from "lodash";
import path from "path";
import db from "#utils/database";
import { getRandomInt } from "#utils/tools";

const mConfigdir = path.resolve(global.rootdir, "resources", "Version2", "wish", "config");
const mElement = JSON.parse(fs.readFileSync(path.resolve(mConfigdir, "character.json")));
const mTypes = JSON.parse(fs.readFileSync(path.resolve(mConfigdir, "weapon.json")));
let mFive, mFour, mIsUp;

function getChoiceData(userID, choice = 301) {
  const { indefinite, character, weapon } = db.get("gacha", "user", { userID }) || {};

  switch (choice) {
    case 200:
      return { name: "indefinite", ...indefinite };
    case 301:
      return { name: "character", ...character };
    case 400:
      // 400 使用 301 的保底
      return { name: "character2", ...character };
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

// 数据参考: https://bbs.nga.cn/read.php?tid=26754637
// 更新时间: 2022年1月16日00:20:00, 不保证概率更新的及时性
function getFiveProb(counter, choice) {
  if (200 === choice || 400 === choice || 301 === choice) {
    return 60 + 600 * (counter > 73 ? counter - 73 : 0);
  } else {
    return 70 + 700 * (counter > 62 ? counter - 62 : 0);
  }
}

function getFourProb(counter, choice) {
  if (200 === choice || 400 === choice || 301 === choice) {
    return 510 + 5100 * (counter > 8 ? counter - 8 : 0);
  } else {
    return 600 + 6000 * (counter > 7 ? counter - 7 : 0);
  }
}

function updateCounter(userID, star, up) {
  if (star !== 5) {
    mFive = mFive + 1;
    mFour = 4 === star ? 1 : mFour + 1; // 重置四星抽数
  } else if ("number" === typeof mIsUp) {
    mFive = 1; // 重置五星抽数
    mFour = mFour + 1;
    mIsUp = up ? (mIsUp > 0 ? mIsUp + 1 : 1) : mIsUp > 0 ? -1 : mIsUp - 1;
  } else {
    mFive = 1;
    mFour = mFour + 1;
  }
}

function getIsUp(userID, star) {
  switch (mIsUp) {
    // weapon default
    case null:
      return getRandomInt(10000) < 7500;
    // indefinite default or uninitialized
    case undefined:
      return false;
    default:
      return getRandomInt(10000) < 5000 || (5 === star && mIsUp < 0);
  }
}

function getStar(userID, choice) {
  const value = getRandomInt(10000);
  const fiveProb = getFiveProb(mFive, choice);
  const fourProb = getFourProb(mFour, choice) + fiveProb;

  switch (true) {
    case value < fiveProb:
      return 5;
    case value < fourProb:
      return 4;
    default:
      return 3;
  }
}

function gachaOnceEggs() {
  const keys = Object.keys(global.eggs.type);
  const index = getRandomInt(keys.length);
  const name = keys[index];

  return {
    ...{ item_type: global.eggs.type[name] || "角色", item_name: name || "刻晴" },
    star: global.eggs.star[name] || 5,
    times: 1,
  };
}

function gachaOnce(userID, choice, table) {
  const star = getStar(userID, choice);
  const up = getIsUp(userID, star);
  const times = mFive;
  let { path } = db.get("gacha", "user", { userID }) || {};
  let result;

  // 彩蛋卡池不写入数据库
  if (999 === choice) {
    return gachaOnceEggs();
  }

  if (Object.keys(table).length < 1) {
    return undefined;
  }

  if (undefined === path) {
    path = { course: null, fate: 0 };
    db.update("gacha", "user", { userID }, { path });
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
      // XXX 无定轨时不应加命定值
      if (up) {
        const index = getRandomInt(table.upFiveStar.length);
        result = table.upFiveStar[index];
        path.fate = index === path.course ? 0 : path.fate + 1;
      } else {
        const index = getRandomInt(table.nonUpFiveStar.length);
        result = table.nonUpFiveStar[index];
        ++path.fate;
      }

      db.update("gacha", "user", { userID }, { path });
    }

    return { ...result, star: 5, times };
  }

  if (5 === star && 302 !== choice) {
    // 限定池和普池出货
    if (up) {
      const index = getRandomInt(table.upFiveStar.length);
      result = table.upFiveStar[index];
    } else {
      const index = getRandomInt(table.nonUpFiveStar.length);
      result = table.nonUpFiveStar[index];
    }

    return { ...result, star: 5, times };
  } else if (4 === star) {
    // 没出货：四星
    if (up) {
      const index = getRandomInt(table.upFourStar.length);
      result = table.upFourStar[index];
    } else {
      const index = getRandomInt(table.nonUpFourStar.length);
      result = table.nonUpFourStar[index];
    }

    return { ...result, star: 4 };
  } else {
    // 没出货：三星
    const index = getRandomInt(table.threeStar.length);
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

  if (999 !== choice && Object.keys(gachaTable).length < 1) {
    return "当前此卡池未开放，请选择其他卡池。";
  }

  if (!uchoice) {
    db.update("gacha", "user", { userID }, { choice });
  }

  // 彩蛋卡池永远十连
  if (999 === choice) {
    times = 10;
  }

  const choiceData = getChoiceData(userID, choice) || {};

  mFive = choiceData.five;
  mFour = choiceData.four;
  mIsUp = choiceData.isUp; // weapon default null, indefinite default undefined

  for (let i = 0; i < times; ++i) {
    const result = gachaOnce(userID, choice, gachaTable);
    undefined !== result && gachaResults.push(result);
  }

  const result = {
    type: choiceData.name,
    user: nickname,
    data: [],
    count: [],
    five: [],
    names: { five: [], four: [], three: [] },
    name_nums: { five: 0, four: 0, three: 0 },
    item_nums: { five: 0, four: 0, three: 0 },
  };

  gachaResults.forEach((c) => {
    c.type = ("武器" === c.item_type ? mTypes : mElement)[c.item_name];
    result.data.push(c);
  });

  // 增加统计信息
  const byStar = {
    five: result.data.filter((c) => 5 === c.star),
    four: result.data.filter((c) => 4 === c.star),
    three: result.data.filter((c) => 3 === c.star),
  };
  const { path } = db.get("gacha", "user", { userID }) || { course: null, fate: 0 };
  const weaponTable = db.get("gacha", "data", { gacha_type: 302 }) || {};
  let fateCourse = {};

  if (Array.isArray(weaponTable.upFiveStar) && undefined !== path && null !== path.course) {
    fateCourse = weaponTable.upFiveStar[path.course] || {};
  }

  result.names.five = Object.keys(lodash.keyBy(byStar.five, "item_name"));
  result.names.four = Object.keys(lodash.keyBy(byStar.four, "item_name"));
  result.names.three = Object.keys(lodash.keyBy(byStar.three, "item_name"));
  result.name_nums.five = result.names.five.length;
  result.name_nums.four = result.names.four.length;
  result.name_nums.three = result.names.three.length;
  result.item_nums.five = byStar.five.length;
  result.item_nums.four = byStar.four.length;
  result.item_nums.three = byStar.three.length;

  byStar.five.forEach((c) => result.five.push(c));
  lodash
    .chain(result.data)
    .keyBy("item_name")
    .keys()
    .each((c) => {
      const a = result.data.filter((cc) => c === cc.item_name);
      result.count.push(lodash.omit({ ...a[0], ...{ count: a.length } }, "times"));
    })
    .value();

  // 无定轨，fate 不可信
  result.path = { fate: (path || {}).fate || 0, course: { type: fateCourse.item_type, name: fateCourse.item_name } };

  // 彩蛋卡池不写入数据库
  if (999 !== choice) {
    // 400 使用 301 的保底
    const pool = 400 === choice ? "character" : choiceData.name;

    data[pool] = { five: mFive, four: mFour, isUp: mIsUp };
    db.update("gacha", "user", { userID }, data);
  }

  return result;
}

export { gachaTimes };
