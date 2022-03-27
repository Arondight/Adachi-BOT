import randomFloat from "random-float";
import db from "#utils/database";

function randomInt(Min, Max) {
  const range = Max - Min + 1;
  return Min + Math.floor(Math.random() * range);
}

function getArtifactID(id) {
  return -1 === id
    ? randomInt(0, Object.values(global.artifacts.domains.id).length - 1)
    : global.artifacts.domains.name[id] && global.artifacts.domains.product[id][randomInt(0, 1)];
}

function getRandomProperty(arr, type) {
  let suffix = [];
  let sum = 0;
  let len = arr.length;

  for (let i = 0; i < len; ++i) {
    sum += arr[i];
    suffix.push(sum);
  }

  const rand = 0 === type ? randomInt(0, sum) : randomFloat(0, sum);

  for (let i = 0; i < len; ++i) {
    if (rand <= suffix[i]) {
      return i;
    }
  }

  return 0;
}

function getSlot() {
  return getRandomProperty(global.artifacts.weights[0], 0);
}

function getMainStat(slot) {
  if (0 === slot) {
    return 0;
  }

  if (1 === slot) {
    return 6;
  }

  const weights = [];
  const len = global.artifacts.weights[slot].length;

  for (let i = 0; i < len; i++) {
    // XXX 在这里可以添加运气权重
    weights.push(global.artifacts.weights[slot][i]);
  }

  return getRandomProperty(weights, -1);
}

function getSubStats(mainStat) {
  let arr = [];
  let sub = [];

  for (let i = 0; i < 10; i++) {
    let w = global.artifacts.weights[1][i] * randomInt(0, 1e3);

    // XXX 在这里可以添加运气权重
    if (i > 4) {
      w *= 1;
    }

    arr.push([i, w]);
  }

  arr.sort((x, y) => {
    return y[1] - x[1];
  });

  for (let i = 0, num = 0; i < 10 && num < 4; i++) {
    if (arr[i][0] !== mainStat) {
      sub.push({
        stat: arr[i][0],
        grade: getRandomProperty(global.artifacts.weights[6], 0),
      });
      num++;
    }
  }

  return sub;
}

function getInit() {
  return getRandomProperty(global.artifacts.weights[5], 0) ? 4 : 3;
}

function getImproves() {
  let improves = [];

  for (let i = 0; i < 5; i++) {
    improves.push({
      place: randomInt(0, 3),
      grade: getRandomProperty(global.artifacts.weights[6], 0),
    });
  }

  return improves;
}

function toArray(property) {
  let res = [];
  let num = 0;

  for (const i in property) {
    let temp = { name: global.artifacts.props.map((c) => c.name)[i] };

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

    property[id] = global.artifacts.values[lv][id];
  }

  return toArray(property);
}

function getFortified(num, subStats, improves) {
  let property = {};

  for (let i = 0; i < 4; i++) {
    const id = subStats[i].stat;
    const lv = subStats[i].grade;
    property[id] = global.artifacts.values[lv][id];
  }

  for (let i = 0; i < num + 1; i++) {
    const p = improves[i].place;
    const id = subStats[p].stat;
    const lv = improves[i].grade;
    property[id] += global.artifacts.values[lv][id];
  }

  return toArray(property);
}

function getArtifact(userID, type) {
  const artifactID = getArtifactID(type);
  const slot = getSlot();
  const slotName = ["生之花", "死之羽", "时之沙", "空之杯", "理之冠"][slot];
  const levelInitial = 0;
  const levelFortified = 20;
  const mainStat = getMainStat(slot);
  const mainStatText = global.artifacts.props.map((c) => c.name)[mainStat] || "";
  const mainValueItem = global.artifacts.props[mainStat] || [];
  const mainValueInitial = (mainValueItem.mainValues || [])[0];
  const mainValueFortified = (mainValueItem.mainValues || [])[1];
  const subStats = getSubStats(mainStat);
  const initPropertyNum = getInit();
  const improves = getImproves();
  const initialProperty = getInitial(initPropertyNum, subStats);
  const fortifiedProperty = getFortified(initPropertyNum, subStats, improves);

  if (undefined === artifactID) {
    return artifactID;
  }

  const name = global.artifacts.artifacts.names[artifactID][slot];

  db.update(
    "artifact",
    "user",
    { userID },
    {
      initial: {
        mainStat,
        mainStatText,
        mainValue: mainValueInitial,
        base: { name, artifactID, slot, slotName, level: levelInitial },
        data: initialProperty,
      },
      fortified: {
        mainStat,
        mainStatText,
        mainValue: mainValueFortified,
        base: { name, artifactID, slot, slotName, level: levelFortified },
        data: fortifiedProperty,
      },
    }
  );
}

function domainInfo() {
  let info = "";

  Object.values(global.artifacts.domains.id).forEach(
    (id) =>
      (info += `${[
        id,
        global.artifacts.domains.name[id],
        ...(Array.isArray(global.artifacts.domains.aliasOf[id]) ? global.artifacts.domains.aliasOf[id] : []),
      ].join("、")}\n`)
  );

  return info;
}

function domainMax() {
  return Math.max(...(Object.values(global.artifacts.domains.id) || [0]));
}

export { domainInfo, domainMax, getArtifact };
