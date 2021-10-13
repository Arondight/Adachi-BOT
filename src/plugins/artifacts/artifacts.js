import randomFloat from "random-float";
import db from "../../utils/database.js";
import { loadYML } from "../../utils/yaml.js";

const artifactCfg = loadYML("artifacts");
const { artifacts, domains, weights, values } = artifactCfg;
const propertyName = [
  "生命值",
  "生命值",
  "防御力",
  "防御力",
  "元素充能效率",
  "元素精通",
  "攻击力",
  "攻击力",
  "暴击伤害",
  "暴击率",
  "物理伤害加成",
  "风元素伤害加成",
  "冰元素伤害加成",
  "雷元素伤害加成",
  "岩元素伤害加成",
  "水元素伤害加成",
  "火元素伤害加成",
  "治疗加成",
];
const dailyFortune = 0;

function randomInt(Min, Max) {
  const range = Max - Min + 1;
  return Min + Math.floor(Math.random() * range);
}

function getArtifactID(domainID) {
  let num;

  if (domainID === -1) {
    num = artifacts.length;
    return randomInt(0, num - 1);
  } else {
    num = domains.length;

    if (domainID >= num) {
      return undefined;
    } else {
      return domains[domainID].product[randomInt(0, 1)];
    }
  }
}

function getRandomProperty(arr, type) {
  let suffix = [];
  let sum = 0,
    len = arr.length;

  for (let i = 0; i < len; i++) {
    sum += arr[i];
    suffix.push(sum);
  }

  let rand = 0 === type ? randomInt(0, sum) : randomFloat(0, sum);

  for (let i = 0; i < len; i++) {
    if (rand <= suffix[i]) {
      return i;
    }
  }
}

function getSlot() {
  return getRandomProperty(weights[0], 0);
}

function getMainStat(slot) {
  if (0 === slot) {
    return 0;
  } else if (1 === slot) {
    return 6;
  } else {
    let float = [];
    const len = weights[slot].length;

    for (let i = 0; i < len; i++) {
      float.push(weights[slot][i] * (1 + dailyFortune));
    }

    return getRandomProperty(float, -1);
  }
}

function getSubStats(mainStat) {
  let arr = [];
  let sub = [];

  for (let i = 0; i < 10; i++) {
    let w = weights[1][i] * randomInt(0, 1e3);

    if (i > 4) {
      w *= 1 + dailyFortune;
    }

    arr.push([i, w]);
  }

  arr.sort((x, y) => {
    return y[1] - x[1];
  });

  for (let i = 0, num = 0; i < 10 && num < 4; i++) {
    if (arr[i][0] !== mainStat) {
      sub.push({ stat: arr[i][0], grade: getRandomProperty(weights[6], 0) });
      num++;
    }
  }

  return sub;
}

function getInit() {
  return getRandomProperty(weights[5], 0) ? 4 : 3;
}

function getImproves() {
  let improves = [];

  for (let i = 0; i < 5; i++) {
    improves.push({
      place: randomInt(0, 3),
      grade: getRandomProperty(weights[6], 0),
    });
  }

  return improves;
}

function toArray(property) {
  let res = [];
  let num = 0;

  for (const i in property) {
    let temp = { name: propertyName[i] };

    if (property[i] < 1) {
      temp.data = (property[i] * 100).toFixed(1) + "%";
    } else {
      temp.data = Math.round(property[i]).toString();
    }

    res[num++] = temp;
  }

  return res;
}

function getInitial(num, subStats) {
  let property = {};

  for (let i = 0; i < num; i++) {
    const id = subStats[i].stat;
    const lv = subStats[i].grade;
    property[id] = values[lv][id];
  }

  return toArray(property);
}

function getFortified(num, subStats, improves) {
  let property = {};

  for (let i = 0; i < 4; i++) {
    const id = subStats[i].stat;
    const lv = subStats[i].grade;
    property[id] = values[lv][id];
  }

  for (let i = 0; i < num + 1; i++) {
    const p = improves[i].place;
    const id = subStats[p].stat;
    const lv = improves[i].grade;
    property[id] += values[lv][id];
  }

  return toArray(property);
}

async function getArtifact(userID, type) {
  const artifactID = getArtifactID(type);
  const slot = getSlot();
  const mainStat = getMainStat(slot);
  const subStats = getSubStats(mainStat);
  const initPropertyNum = getInit();
  const improves = getImproves();
  const initialProperty = getInitial(initPropertyNum, subStats);
  const fortifiedProperty = getFortified(initPropertyNum, subStats, improves);

  if (!artifactID) {
    return artifactID;
  }

  const name = artifacts[artifactID]["subName"][slot];

  await db.update(
    "artifact",
    "user",
    { userID },
    {
      initial: {
        mainStat,
        base: { name, artifactID, slot, level: 0 },
        data: initialProperty,
      },
      fortified: {
        mainStat,
        base: { name, artifactID, slot, level: 20 },
        data: fortifiedProperty,
      },
    }
  );
}

function domainInfo() {
  let domainsMsg = "";

  for (const i in domains) {
    if (domains[i]) {
      domainsMsg += `${[
        i,
        domains[i].name,
        ...(Array.isArray(domains[i].alias) ? domains[i].alias : []),
      ].join("、")}\n`;
    }
  }

  return domainsMsg;
}

function domainMax() {
  return domains.length - 1;
}

export { getArtifact, domainInfo, domainMax };
