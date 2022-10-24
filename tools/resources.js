import fs from "fs";
import lodash from "lodash";
import fetch from "node-fetch";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import "#utils/config";
import { mkdir } from "#utils/file";
import { imgMeta, toWebp, toWebpFile, webpOpt, webpPos } from "#utils/sharp";

("use strict");

const m_RESDIR = Object.freeze(mkdir(path.resolve(global.rootdir, "resources")));
const m_DIR = Object.freeze({
  char: mkdir(path.resolve(m_RESDIR, "character")),
  doc: mkdir(path.resolve(m_RESDIR, "info", "doc")),
  material: mkdir(path.resolve(m_RESDIR, "material")),
  weapon: mkdir(path.resolve(m_RESDIR, "weapon")),
});
const m_NICK_AMBR_TO_HONEY = Object.freeze({
  amber: "ambor",
  heizou: "heizo",
  jean: "qin",
  kujousara: "sara",
  noelle: "noel",
  shogun: "shougun",
  thoma: "tohma",
  traveler: "playerboy",
  yaemiko: "yae",
  yanfei: "feiyan",
});
const m_ELEM_CN = Object.freeze({
  electric: "雷元素",
  fire: "火元素",
  grass: "草元素",
  ice: "冰元素",
  rock: "岩元素",
  water: "水元素",
  wind: "风元素",
});
const m_DAY_OF_WEEK_CN = Object.freeze({
  monday: "一",
  tuesday: "二",
  wednesday: "三",
  thursday: "四",
  friday: "五",
  saturday: "六",
  sunday: "日",
});
const m_UNKNOWN = Object.freeze("未知");
const m_YE = Object.freeze("旅行者");
const m_YE_EN = Object.freeze("Traveler");
const m_KONG = Object.freeze("空");
const m_KONG_EN = Object.freeze("Aether");
const m_YING = Object.freeze("荧");
const m_YING_EN = Object.freeze("Lumine");
const m_ID_KONG = 10000005;
const m_ID_YING = 10000007;
const m_CAO = Object.freeze("草元素");
const m_CAO_EN = Object.freeze("Grass");
const m_AMBR_TOP = Object.freeze("https://api.ambr.top");
const m_HONEY_HUNTER_WORLD_COM = Object.freeze("https://genshin.honeyhunterworld.com");
const m_PROJECT_CELESTIA_COM = Object.freeze("https://www.projectcelestia.com");
const m_API_V2 = Object.freeze(`${m_AMBR_TOP}/v2`);
const m_API = Object.freeze({
  character: {
    info: `${m_API_V2}/chs/avatar`,
    infoEn: `${m_API_V2}/en/avatar`,
    curve: `${m_API_V2}/static/avatarCurve`,
  },
  weapon: {
    info: `${m_API_V2}/chs/weapon`,
    curve: `${m_API_V2}/static/weaponCurve`,
    manual: `${m_API_V2}/chs/manualWeapon`,
  },
  material: {
    info: `${m_API_V2}/chs/material`,
  },
});

const mData = {
  character: {
    info: [],
    infoEn: [],
    curve: [],
  },
  weapon: {
    info: [],
    curve: [],
    manual: {},
  },
  material: {
    info: [],
  },
};

function isYe(name) {
  return [m_YE, m_KONG, m_KONG_EN, m_YING, m_YING_EN].includes(name);
}

/***
 * @param {string} id - id text from ambr.top API.
 * @param {string} lang - "zh" or "en".
 */
function nameOfYe(id, lang = "zh") {
  const langId = Object.freeze(["zh", "en"]).indexOf(lang) || 0;
  const names = Object.freeze({
    [m_ID_KONG]: [m_KONG, m_KONG_EN],
    [m_ID_YING]: [m_YING, m_YING_EN],
  });

  id = String(id).match(/\d+/)[0];

  for (const [i, n] of Object.entries(names)) {
    if (i === id) {
      return n[langId];
    }
  }
}

async function imgToWebpFile(
  buffer,
  file,
  lossless = true,
  width = { resize: webpOpt.NONE, size: 0 },
  height = { resize: webpOpt.NONE, size: 0 },
  position = webpPos.CENTER
) {
  process.stdout.write(`转换 ${file} ……\t`);

  try {
    await toWebpFile(buffer, file, lossless, width, height, position);
    console.log("成功");
  } catch (e) {
    console.log("失败");
  }
}

async function remoteImgToWebpFile(
  url,
  file,
  lossless = true,
  width = { resize: webpOpt.NONE, size: 0 },
  height = { resize: webpOpt.NONE, size: 0 },
  position = webpPos.CENTER
) {
  let buffer;

  try {
    buffer = Buffer.from(await getBinBuffer(url));
  } catch (e) {
    return;
  }

  return imgToWebpFile(buffer, file, lossless, width, height, position);
}

function tagColorToSpan(text) {
  return text.replaceAll(/<color=#\w+?>/g, '<span class="desc-number recolor">').replaceAll("</color>", "</span>");
}

function getMaterialIdByName(name) {
  return (mData.material.info.filter((c) => String(c.name) === name)[0] || {}).id;
}

function getMaterialNameById(id) {
  return (mData.material.info.filter((c) => String(c.id) === id)[0] || {}).name;
}

function getAscensionFromData(data) {
  const ascension = { talent: {}, upgrade: {} };

  if (undefined !== data.talent) {
    for (const e of Object.values(data.talent[0].promote)) {
      if (null !== e.costItems) {
        for (const [id, num] of Object.entries(e.costItems)) {
          ascension.talent[id] = ("number" === typeof ascension.talent[id] ? ascension.talent[id] : 0) + parseInt(num);
        }
      }
    }
  }

  for (const e of Object.values(data.upgrade.promote)) {
    if (undefined !== e.costItems) {
      for (const [id, num] of Object.entries(e.costItems)) {
        ascension.upgrade[id] = ("number" === typeof ascension.upgrade[id] ? ascension.upgrade[id] : 0) + parseInt(num);
      }
    }
  }

  return ascension;
}

async function getBinBuffer(url, slient = false) {
  let error;

  if (false === slient) {
    process.stdout.write(`拉取 ${url} ……\t`);
  }

  try {
    const response = await fetch(url, { method: "GET" });

    if (200 === response.status) {
      console.log("成功");
      return await response.arrayBuffer();
    }
  } catch (e) {
    error = e;
  }

  if (false === slient) {
    console.log("失败");
  }

  if (undefined !== error) {
    throw error;
  }
}

async function getJsonObj(url, callback = (e) => e, slient = false) {
  let error;

  if (false === slient) {
    process.stdout.write(`拉取 ${url} ……\t`);
  }

  try {
    const response = await fetch(url, { method: "GET" });

    if (200 === response.status) {
      const jbody = await response.json();

      if (200 === jbody.response && undefined !== jbody.data && Object.keys(jbody.data).length > 0) {
        const data = callback(jbody.data);

        if (false === slient) {
          console.log("成功");
        }

        return data;
      }

      throw Error("invalid data");
    }
  } catch (e) {
    error = e;
  }

  if (false === slient) {
    console.log("失败");
  }

  if (undefined !== error) {
    throw error;
  }

  return {};
}

async function getData() {
  mData.character.info = await getJsonObj(m_API.character.info, (data) => {
    const parsed = [];

    for (const item of Object.values(data.items)) {
      if (Object.keys(data.types).includes(item.weaponType)) {
        item.element = m_ELEM_CN[item.element.toLowerCase()];
        item.rarity = item.rank;
        item.type = data.types[item.weaponType];
        item.icon = item.icon.match(/(?<=UI_AvatarIcon_)\w+/)[0];

        // 这里分荧妹和龙哥
        if (m_YE === item.name) {
          item.name = nameOfYe(item.id);
        }

        if (!(isYe(item.name) && m_CAO !== item.element)) {
          parsed.push(lodash.pick(item, ["birthday", "element", "icon", "id", "name", "rarity", "type"]));
        }
      }
    }

    return parsed;
  });
  mData.character.infoEn = await getJsonObj(m_API.character.infoEn, (data) => {
    const parsed = [];

    for (const item of Object.values(data.items)) {
      if (Object.keys(data.types).includes(item.weaponType)) {
        // 这里分荧妹和龙哥
        if (m_YE_EN === item.name) {
          item.name = nameOfYe(item.id, "en");
        }

        if (!(isYe(item.name) && m_CAO_EN !== item.element)) {
          parsed.push(lodash.pick(item, ["id", "name"]));
        }
      }
    }

    return parsed;
  });
  mData.character.curve = await getJsonObj(m_API.character.curve, (data) => {
    const parsed = [];

    for (const item of Object.values(data)) {
      parsed.push(item.curveInfos);
    }

    return parsed;
  });
  mData.weapon.info = await getJsonObj(m_API.weapon.info, (data) => {
    const parsed = [];

    for (const item of Object.values(data.items)) {
      if (Object.keys(data.types).includes(item.type)) {
        item.rarity = item.rank;
        item.type = data.types[item.type];
        item.icon = item.icon.match(/(?<=UI_EquipIcon_)\w+/)[0];
        parsed.push(lodash.pick(item, ["icon", "id", "name", "rarity", "type"]));
      }
    }

    return parsed;
  });
  mData.weapon.curve = await getJsonObj(m_API.weapon.curve, (data) => {
    const parsed = [];

    for (const item of Object.values(data)) {
      parsed.push(item.curveInfos);
    }

    return parsed;
  });
  mData.weapon.manual = await getJsonObj(m_API.weapon.manual);
  mData.material.info = await getJsonObj(m_API.material.info, (data) => {
    const parsed = [];

    for (const item of Object.values(data.items)) {
      if (Object.keys(data.types).includes(item.type)) {
        item.type = data.types[item.type];
      }

      parsed.push(lodash.pick(item, ["id", "name", "type"]));
    }

    return parsed;
  });
}

async function parseCharInfo(name) {
  const item = (mData.character.info.filter((c) => c.name === name) || [])[0];

  process.stdout.write(`检查【${name}】是否为角色 ……\t`);

  if (undefined === item) {
    console.log("不是");
    return;
  }

  console.log("是");
  process.stdout.write(`收集【${name}】的角色信息 ……\t`);

  try {
    const { id } = item;
    const api = `${m_API_V2}/CHS/avatar/${id}`;
    const data = await getJsonObj(api, (e) => e, true);
    const info = {
      access: "",
      ascensionMaterials: [],
      baseATK: 0,
      birthday: `${data.birthday[0]}月${data.birthday[1]}日`,
      constellationName: data.fetter.constellation,
      constellations: "",
      cvCN: data.fetter.cv.CHS || m_UNKNOWN,
      cvJP: data.fetter.cv.JP || m_UNKNOWN,
      element: m_ELEM_CN[data.element.toLowerCase()],
      id: parseInt(data.id),
      introduce: data.fetter.detail,
      levelUpMaterials: [],
      mainStat: "",
      mainValue: "",
      name: isYe(data.name) ? nameOfYe(data.id) : data.name,
      passiveDesc: tagColorToSpan(isYe(data.name) ? "" : data.talent[6].description),
      passiveTitle: isYe(data.name) ? "" : data.talent[6].name,
      rarity: data.rank,
      talentMaterials: [],
      time: "",
      title: data.fetter.title,
      type: "角色",
    };
    const ascension = getAscensionFromData(data);
    let aTalentMaterial;

    // info.ascensionMaterials
    const ascensionMaterialsIdx = [
      // [number, rarity]
      [1, 2],
      [9, 3],
      [9, 4],
      [6, 5],
      [46, 4],
    ];

    for (let i = 0; i < ascensionMaterialsIdx.length; ++i) {
      for (const [id, num] of Object.entries(ascension.upgrade)) {
        const rarity = parseInt(data.ascension[id]);

        if (num === ascensionMaterialsIdx[i][0] && rarity === ascensionMaterialsIdx[i][1]) {
          info.ascensionMaterials[i] = getMaterialNameById(id);
        }
      }
    }

    if (undefined === info.ascensionMaterials[4]) {
      info.ascensionMaterials[4] = info.ascensionMaterials[3];
    }

    // info.baseATK
    const atkPropType = "FIGHT_PROP_BASE_ATTACK";
    const { type: atkType, initValue: atkBaseVal } =
      (Object.values(data.upgrade.prop).filter((c) => c.propType === atkPropType) || [])[0] || {};

    info.baseATK = parseFloat(mData.character.curve[90 - 1][atkType]) * parseFloat(atkBaseVal);
    info.baseATK += parseFloat(data.upgrade.promote[6].addProps.FIGHT_PROP_BASE_ATTACK);

    // info.constellations
    const [E, Q] = [data.talent[1], data.talent[3] || data.talent[4]].map((c) => c.name);

    info.constellations = Object.values(data.constellation).map((c) =>
      tagColorToSpan(c.description.replaceAll("\\n", "").replaceAll(E, "元素战技").replaceAll(Q, "元素爆发"))
    );

    // info.levelUpMaterials
    const levelUpMaterialsIdx = [
      // [number, rarity]
      [168, 1],
      [18, 1],
      [30, 2],
      [36, 3],
    ];

    for (let i = 0; i < levelUpMaterialsIdx.length; ++i) {
      for (const [id, num] of Object.entries(ascension.upgrade)) {
        const rarity = parseInt(data.ascension[id]);

        if (num === levelUpMaterialsIdx[i][0] && rarity === levelUpMaterialsIdx[i][1]) {
          info.levelUpMaterials[i] = getMaterialNameById(id);
        }
      }
    }

    // info.mainStat and info.mainValue
    const { addProps } =
      (Object.values(data.upgrade.promote)
        .slice(1)
        .filter((c) => 6 === c.promoteLevel) || [])[0] || {};
    const mainProp = (Object.keys(addProps).filter(
      (c) => !["FIGHT_PROP_BASE_ATTACK", "FIGHT_PROP_BASE_DEFENSE", "FIGHT_PROP_BASE_HP"].includes(c)
    ) || [])[0];
    const mainValue = parseFloat(addProps[mainProp]);

    info.mainStat = mData.weapon.manual[mainProp];
    info.mainValue = String(mainValue);

    if (mainValue < 1) {
      info.mainValue = `${parseFloat(mainValue * 100).toFixed(2)}%`;
    }

    // info.talentMaterials
    const talentMaterialsIdx = isYe(data.name)
      ? [
          // [number, rarity]
          [3, 2],
          [6, 3],
          [6, 4],
          [6, 5],
        ]
      : [
          // [number, rarity]
          [3, 2],
          [21, 3],
          [38, 4],
          [6, 5],
        ];

    for (let i = 0; i < talentMaterialsIdx.length; ++i) {
      for (const [id, num] of Object.entries(ascension.talent)) {
        const rarity = parseInt(data.ascension[id]);

        if (num === talentMaterialsIdx[i][0] && rarity === talentMaterialsIdx[i][1]) {
          if (info.talentMaterials.includes(id)) {
            continue;
          }

          info.talentMaterials[i] = id;
        }
      }
    }

    aTalentMaterial = info.talentMaterials[0];

    for (let i = 0; i < info.talentMaterials.length; ++i) {
      info.talentMaterials[i] = getMaterialNameById(info.talentMaterials[i]);
    }

    // info.time
    const materialInfo = await getJsonObj(`${m_API_V2}/CHS/material/${aTalentMaterial}`, (e) => e, true);
    const days = Object.values(Object.values(materialInfo.source).filter((c) => undefined !== c.days)[0].days).map(
      (c) => m_DAY_OF_WEEK_CN[c.toLowerCase()]
    );

    info.time = `【周${days.join("/")}】`;

    console.log("成功");
    return info;
  } catch (e) {
    console.log("失败");
    throw e;
  }
}

async function parseWeaponInfo(name) {
  const item = (mData.weapon.info.filter((c) => c.name === name) || [])[0];

  process.stdout.write(`检查【${name}】是否为武器 ……\t`);

  if (undefined === item) {
    console.log("不是");
    return;
  }

  console.log("是");
  process.stdout.write(`收集【${name}】的武器信息 ……\t`);

  try {
    const { id } = item;
    const api = `${m_API_V2}/CHS/weapon/${id}`;
    const data = await getJsonObj(api, (e) => e, true);
    const info = {
      access: "",
      ascensionMaterials: [[], []],
      baseATK: 0,
      introduce: data.description,
      mainStat: "",
      mainValue: "",
      name: data.name,
      rarity: data.rank,
      skillContent: "",
      skillName: null !== data.affix ? Object.values(data.affix)[0].name : "",
      time: "",
      title: data.type,
      type: "武器",
    };
    const ascension = getAscensionFromData(data);
    let aUpgradeMaterial;

    // info.ascensionMaterials
    const ascensionMaterialsIdx = [[], []];

    switch (data.rank) {
      case 5: {
        ascensionMaterialsIdx[0] = [
          // [number, rarity]
          [5, 2],
          [14, 3],
          [14, 4],
          [6, 5],
        ];
        ascensionMaterialsIdx[1] = [
          // [number, rarity]
          [23, 2],
          [27, 3],
          [41, 4],
          [15, 1],
          [23, 2],
          [27, 3],
        ];

        break;
      }
      case 4: {
        ascensionMaterialsIdx[0] = [
          // [number, rarity]
          [3, 2],
          [9, 3],
          [9, 4],
          [4, 5],
        ];
        ascensionMaterialsIdx[1] = [
          // [number, rarity]
          [15, 2],
          [18, 3],
          [27, 4],
          [10, 1],
          [15, 2],
          [18, 3],
        ];

        break;
      }
      case 3: {
        ascensionMaterialsIdx[0] = [
          // [number, rarity]
          [2, 2],
          [6, 3],
          [6, 4],
          [3, 5],
        ];
        ascensionMaterialsIdx[1] = [
          // [number, rarity]
          [10, 2],
          [12, 3],
          [18, 4],
          [6, 1],
          [10, 2],
          [12, 3],
        ];

        break;
      }
      case 2: {
        ascensionMaterialsIdx[0] = [
          // [number, rarity]
          [1, 2],
          [4, 3],
          [1, 4],
        ];
        ascensionMaterialsIdx[1] = [
          // [number, rarity]
          [6, 2],
          [8, 3],
          [5, 1],
          [7, 2],
        ];

        break;
      }
      case 1: {
        ascensionMaterialsIdx[0] = [
          // [number, rarity]
          [1, 2],
          [3, 3],
          [1, 4],
        ];
        ascensionMaterialsIdx[1] = [
          // [number, rarity]
          [5, 2],
          [6, 3],
          [3, 1],
          [5, 2],
        ];

        break;
      }
    }

    for (let i = 0; i < ascensionMaterialsIdx.length; ++i) {
      for (let j = 0; j < ascensionMaterialsIdx[i].length; ++j) {
        const upgrade = Object.entries(ascension.upgrade);
        const border = ascensionMaterialsIdx[1].length / 2;

        for (let k = 0; k < upgrade.length; ++k) {
          const [id, num] = upgrade[k];
          const rarity = parseInt(data.ascension[id]);

          if (
            num === ascensionMaterialsIdx[i][j][0] &&
            rarity === ascensionMaterialsIdx[i][j][1] &&
            (0 === i || j % border === k % border)
          ) {
            info.ascensionMaterials[i][j] = id;
            break;
          }
        }
      }
    }

    aUpgradeMaterial = info.ascensionMaterials[0][0];

    for (let i = 0; i < info.ascensionMaterials.length; ++i) {
      for (let j = 0; j < info.ascensionMaterials[i].length; ++j) {
        info.ascensionMaterials[i][j] = getMaterialNameById(info.ascensionMaterials[i][j]);
      }
    }

    // info.baseATK
    const props = Object.values(data.upgrade.prop);
    const { type: atkType, initValue: baseVal } = props.filter((c) => "FIGHT_PROP_BASE_ATTACK" === c.propType)[0] || {};

    info.baseATK =
      parseFloat(mData.weapon.curve[data.rank < 3 ? 70 - 1 : 90 - 1][atkType]) * parseFloat(baseVal) +
      parseFloat(data.upgrade.promote[data.rank < 3 ? 4 : 6].addProps.FIGHT_PROP_BASE_ATTACK);

    // info.mainStat and info.mainValue
    const { propType: mainStat } = props[1] || {};
    const { type: mainValue, initValue: mainValueBase } =
      props.filter((c) => "FIGHT_PROP_BASE_ATTACK" !== c.propType)[0] || {};

    info.mainStat = data.rank < 3 ? "" : mData.weapon.manual[mainStat];
    info.mainValue = "";

    if (data.rank > 2) {
      info.mainValue = parseFloat(mData.weapon.curve[90 - 1][mainValue]) * parseFloat(mainValueBase);

      if (mainValueBase < 1) {
        info.mainValue *= 100;
      }

      info.mainValue = String(info.mainValue);

      if (mainValueBase < 1) {
        info.mainValue = `${info.mainValue}%`;
      }
    }

    // info.skillContent
    if (null !== data.affix) {
      const contents = Object.values(Object.values(data.affix)[0].upgrade);
      const numReg = /[\d.]+%?/g;
      const numsList = contents.map((c) => c.match(numReg) || []);
      const texts = contents[0].split(numReg);

      for (let i = 0; i < texts.length - 1; ++i) {
        let sameVal = true;

        info.skillContent += texts[i].replaceAll("\\n", "");

        for (let i1 = 1; i1 < numsList.length; ++i1) {
          if (numsList[0][i] !== numsList[i1][i]) {
            sameVal = false;
            break;
          }
        }

        if (true === sameVal) {
          info.skillContent += numsList[0][i];
        } else {
          for (const nums of numsList.filter((c) => Array.isArray(c) && c.length > 0)) {
            info.skillContent += `${nums[i]}/`;
          }

          info.skillContent = info.skillContent.slice(0, -1);
        }
      }

      info.skillContent += texts[texts.length - 1];
      info.skillContent = tagColorToSpan(info.skillContent);
    }

    // info.time
    const materialInfo = await getJsonObj(`${m_API_V2}/CHS/material/${aUpgradeMaterial}`, (e) => e, true);
    const days = Object.values(Object.values(materialInfo.source).filter((c) => undefined !== c.days)[0].days).map(
      (c) => m_DAY_OF_WEEK_CN[c.toLowerCase()]
    );

    info.time = `【周${days.join("/")}】`;

    console.log("成功");
    return info;
  } catch (e) {
    console.log("失败");
    throw e;
  }
}

async function getMaterialImg(name) {
  const icondir = mkdir(path.resolve(m_DIR.material, "icon"));
  const file = path.resolve(icondir, `${name}.webp`);

  if (!fs.existsSync(file)) {
    await remoteImgToWebpFile(
      `${m_AMBR_TOP}/assets/UI/UI_ItemIcon_${getMaterialIdByName(name)}.png`,
      file,
      false,
      { resize: webpOpt.RESIZE, size: 256 },
      { resize: webpOpt.RESIZE, size: 256 },
      webpPos.CENTER
    );
  }
}

async function getGachaImg(url, file, lossless = true, isChar = true, size = [320, 1024], position = webpPos.BOTTOM) {
  function resize(from = [0, 0], to = [0, 0]) {
    const [width, height] = from;
    const [widthTo, heightTo] = to;

    if (width !== widthTo || height !== heightTo) {
      const [xs, ys] = [widthTo / width, heightTo / height];
      let [x, y] = [widthTo, heightTo];

      if (xs < ys) {
        y = height * xs;
      }

      if (ys < xs) {
        x = width * ys;
      }

      return [Math.floor(x), Math.floor(y)];
    }

    return to;
  }

  let gachaImg = await getBinBuffer(url);
  const { width, height } = await imgMeta(gachaImg);
  const [widthTo, heightTo] = size;
  const [x, y] = resize([width, height], [widthTo, heightTo]);

  if (true === isChar) {
    if (width > widthTo || height > heightTo) {
      gachaImg = await toWebp(
        gachaImg,
        true,
        { resize: webpOpt.RESIZE, size: x },
        { resize: webpOpt.RESIZE, size: y },
        webpPos.CENTER
      );
    }
  } else {
    if (width !== widthTo || height !== heightTo) {
      gachaImg = await toWebp(
        gachaImg,
        true,
        { resize: webpOpt.CROP, size: widthTo },
        { resize: webpOpt.CROP, size: heightTo },
        webpPos.CENTER
      );
    }
  }

  await imgToWebpFile(
    gachaImg,
    file,
    lossless,
    { resize: webpOpt.CROP, size: widthTo },
    { resize: webpOpt.CROP, size: heightTo },
    position
  );
}

async function getCharRes(info) {
  const item = (mData.character.info.filter((c) => c.name === info.name) || [])[0];
  const icondir = mkdir(path.resolve(m_DIR.char, "icon"));
  const carddir = mkdir(path.resolve(m_DIR.char, "namecard"));
  const gachadir = mkdir(path.resolve(m_DIR.char, "gacha"));
  let file;

  // icon
  file = path.resolve(icondir, `${item.name}.webp`);

  if (!fs.existsSync(file)) {
    await remoteImgToWebpFile(
      `${m_AMBR_TOP}/assets/UI/UI_AvatarIcon_${item.icon}.png`,
      file,
      false,
      { resize: webpOpt.RESIZE, size: 256 },
      { resize: webpOpt.RESIZE, size: 256 },
      webpPos.CENTER
    );
  }

  // namecard
  file = path.resolve(carddir, `${item.name}.webp`);

  if (!fs.existsSync(file)) {
    let icon = item.icon;

    if ("Yae" === icon) {
      icon = "Yae1";
    }

    await remoteImgToWebpFile(
      `${m_AMBR_TOP}/assets/UI/namecard/UI_NameCardPic_${icon}_P.png`,
      file,
      false,
      { resize: webpOpt.RESIZE, size: 840 },
      { resize: webpOpt.RESIZE, size: 400 },
      webpPos.CENTER
    );
  }

  // material
  for (const e of [...info.ascensionMaterials, ...info.levelUpMaterials, ...info.talentMaterials]) {
    if ("string" === typeof e) {
      await getMaterialImg(e);
    }
  }

  // gacha
  let { name: nameEn } = (mData.character.infoEn.filter((c) => parseInt(c.id) === info.id) || [])[0];

  if (nameEn.includes(" ") && nameEn.length > 10) {
    nameEn = nameEn.split(" ").slice(-1)[0];
  }

  nameEn = nameEn.toLowerCase().replaceAll(/\s/g, "");
  nameEn = m_NICK_AMBR_TO_HONEY[nameEn] || nameEn;
  file = path.resolve(gachadir, `${item.name}.webp`);

  if (!fs.existsSync(file)) {
    const gachaId = String(info.id).slice(-3);

    await getGachaImg(`${m_HONEY_HUNTER_WORLD_COM}/img/${nameEn}_${gachaId}_gacha_card.webp`, file, false);
  }
}

async function getWeaponRes(info) {
  const item = (mData.weapon.info.filter((c) => c.name === info.name) || [])[0];
  const icondir = mkdir(path.resolve(m_DIR.weapon, "icon"));
  const gachadir = mkdir(path.resolve(m_DIR.weapon, "gacha"));
  let file;

  // icon
  file = path.resolve(icondir, `${item.name}.webp`);

  if (!fs.existsSync(file)) {
    await remoteImgToWebpFile(
      `${m_AMBR_TOP}/assets/UI/UI_EquipIcon_${item.icon}.png`,
      file,
      false,
      { resize: webpOpt.RESIZE, size: 256 },
      { resize: webpOpt.RESIZE, size: 256 },
      webpPos.CENTER
    );
  }

  // material
  for (const e of lodash.flatten(info.ascensionMaterials)) {
    if ("string" === typeof e) {
      await getMaterialImg(e);
    }
  }

  // gacha
  file = path.resolve(gachadir, `${item.name}.webp`);

  if (!fs.existsSync(file)) {
    const urls = [
      `${m_PROJECT_CELESTIA_COM}/static/images/UI_Gacha_EquipIcon_${item.icon}.webp`,
      `${m_HONEY_HUNTER_WORLD_COM}/img/i_n${item.id}_gacha_icon.webp`,
    ];
    const losslessIdx = 1;
    let ok = false;

    for (let i = 0; i < urls.length; ++i) {
      try {
        await getGachaImg(urls[i], file, i >= losslessIdx, false, [320, 1024], webpPos.CENTER);
        ok = true;
        break;
      } catch (e) {
        // do nothing
      }
    }

    if (!ok) {
      throw Error(`Failed to get gacha image.`);
    }
  }
}

function writeData(name, data = {}) {
  const file = path.resolve(m_DIR.doc, `${name}.json`);
  let old = {};

  process.stdout.write(`写入文件 ${file} ……\t`);

  if (undefined === data || 0 === Object.keys(data)) {
    console.log("数据错误。");
    return;
  }

  try {
    if (fs.existsSync(file)) {
      // FIXME 这个字段从哪儿能拼出来？
      old = lodash.pick(JSON.parse(fs.readFileSync(file)), "access");
    }

    fs.writeFileSync(file, JSON.stringify(Object.assign(data, old || "祈愿"), null, 2));
  } catch (e) {
    console.log("失败");
    return;
  }

  console.log("成功");
}

(async function main() {
  const { argv } = yargs(hideBin(process.argv))
    .usage("-n <array>")
    .example("-n 刻晴 天空之刃 莫娜 天空之卷")
    .help("help")
    .alias("help", "h")
    .version(false)
    .array("name")
    .options({
      name: {
        alias: "n",
        type: "array",
        description: "名称",
        requiresArg: true,
        required: true,
      },
    });

  try {
    await getData();
  } catch (e) {
    console.log(`获取信息错误，无法继续。\n错误的详细信息见下。\n${e.stack}`);
    return -1;
  }

  let errcode = 0;
  const failedNames = [];

  for (const n of argv.name.filter((c) => "" !== c)) {
    try {
      const info = (await parseWeaponInfo(n)) || (await parseCharInfo(n));

      if (undefined === info) {
        console.log(`没有找到名为【${n}】的角色或武器。`);
        continue;
      }

      writeData(n, info);

      if ("角色" === info.type) {
        await getCharRes(info);
      } else {
        await getWeaponRes(info);
      }
    } catch (e) {
      console.log(`为【${n}】生成描述文件失败，跳过。\n错误的详细信息见下。\n${e.stack}`);
      failedNames.push(n);
      errcode = -1;
    }
  }

  if (failedNames.length > 0) {
    console.error(`以下角色或武器生成资源文件失败。\n${failedNames.join(" ")}`);
  } else {
    console.log("已完成。");
  }

  return errcode;
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
