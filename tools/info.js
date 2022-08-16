import fs from "fs";
import lodash from "lodash";
import fetch from "node-fetch";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import "#utils/config";
import { mkdir } from "#utils/file";

const mElemCN = {
  electric: "雷元素",
  water: "水元素",
  wind: "风元素",
  ice: "冰元素",
  fire: "火元素",
  rock: "岩元素",
  grass: "草元素",
};
const mDayOfWeekCN = {
  monday: "一",
  tuesday: "二",
  wednesday: "三",
  thursday: "四",
  friday: "五",
  saturday: "六",
  sunday: "日",
};

const mApiPrefix = "https://api.ambr.top/v2";
const mApi = {
  character: {
    info: `${mApiPrefix}/chs/avatar`,
    curve: `${mApiPrefix}/static/avatarCurve`,
  },
  weapon: {
    info: `${mApiPrefix}/chs/weapon`,
    curve: `${mApiPrefix}/static/weaponCurve`,
    manual: `${mApiPrefix}/CHS/manualWeapon`,
  },
  material: {
    info: `${mApiPrefix}/CHS/material`,
  },
};
const mData = {
  character: {
    info: [],
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

function tagColorToSpan(text) {
  return text.replaceAll(/<color=#\w+?>/g, '<span class="desc-number recolor">').replaceAll("</color>", "</span>");
}

function getMaterialNameByID(id) {
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

async function getJsonObj(url, callback = (e) => e, slient = false) {
  let error;

  if (false === slient) {
    process.stdout.write(`拉取 ${url} ...\t`);
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
  mData.character.info = await getJsonObj(mApi.character.info, (data) => {
    const parsed = [];

    for (const item of Object.values(data.items)) {
      if (Object.keys(data.types).includes(item.weaponType)) {
        item.element = mElemCN[item.element.toLowerCase()];
        item.rarity = item.rank;
        item.type = data.types[item.weaponType];

        if (!("旅行者" === item.name && "风元素" !== item.element)) {
          parsed.push(lodash.pick(item, ["birthday", "element", "id", "name", "rarity", "type"]));
        }
      }
    }

    return parsed;
  });
  mData.character.curve = await getJsonObj(mApi.character.curve, (data) => {
    const parsed = [];

    for (const item of Object.values(data)) {
      parsed.push(item.curveInfos);
    }

    return parsed;
  });
  mData.weapon.info = await getJsonObj(mApi.weapon.info, (data) => {
    const parsed = [];

    for (const item of Object.values(data.items)) {
      if (Object.keys(data.types).includes(item.type)) {
        item.rarity = item.rank;
        item.type = data.types[item.type];
        parsed.push(lodash.pick(item, ["id", "name", "rarity", "type"]));
      }
    }

    return parsed;
  });
  mData.weapon.curve = await getJsonObj(mApi.weapon.curve, (data) => {
    const parsed = [];

    for (const item of Object.values(data)) {
      parsed.push(item.curveInfos);
    }

    return parsed;
  });
  mData.weapon.manual = await getJsonObj(mApi.weapon.manual);
  mData.material.info = await getJsonObj(mApi.material.info, (data) => {
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
    const api = `${mApiPrefix}/CHS/avatar/${id}`;
    const data = await getJsonObj(api, (e) => e, true);
    const info = {
      access: "",
      ascensionMaterials: [],
      baseATK: 0,
      birthday: `${data.birthday[0]}月${data.birthday[1]}日`,
      constellationName: data.fetter.constellation,
      constellations: "",
      cv: `${data.fetter.cv.CHS} | ${data.fetter.cv.JP}`,
      cvCN: data.fetter.cv.CHS,
      cvJP: data.fetter.cv.JP,
      element: mElemCN[data.element.toLowerCase()],
      id: parseInt(data.id),
      introduce: data.fetter.detail,
      levelUpMaterials: [],
      mainStat: "",
      mainValue: "",
      name: data.name,
      passiveDesc: tagColorToSpan("旅行者" !== data.name ? data.talent[6].description : ""),
      passiveTitle: "旅行者" !== data.name ? data.talent[6].name : "",
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
          info.ascensionMaterials[i] = getMaterialNameByID(id);
        }
      }
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
          info.levelUpMaterials[i] = getMaterialNameByID(id);
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
    const talentMaterialsIdx = [
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
          info.talentMaterials[i] = id;
        }
      }
    }

    aTalentMaterial = info.talentMaterials[0];

    for (let i = 0; i < info.talentMaterials.length; ++i) {
      info.talentMaterials[i] = getMaterialNameByID(info.talentMaterials[i]);
    }

    // info.time
    const materialInfo = await getJsonObj(`${mApiPrefix}/CHS/material/${aTalentMaterial}`, (e) => e, true);
    const days = Object.values(Object.values(materialInfo.source).filter((c) => undefined !== c.days)[0].days).map(
      (c) => mDayOfWeekCN[c.toLowerCase()]
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
    const api = `${mApiPrefix}/CHS/weapon/${id}`;
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
        for (const [id, num] of Object.entries(ascension.upgrade)) {
          const rarity = parseInt(data.ascension[id]);

          if (num === ascensionMaterialsIdx[i][j][0] && rarity === ascensionMaterialsIdx[i][j][1]) {
            if (
              !(
                j > 0 &&
                0 !== j % (ascensionMaterialsIdx[1].length / 2) &&
                1 !== id - info.ascensionMaterials[i][j - 1]
              )
            ) {
              info.ascensionMaterials[i][j] = id;
            }
          }
        }
      }
    }

    aUpgradeMaterial = info.ascensionMaterials[0][0];

    for (let i = 0; i < info.ascensionMaterials.length; ++i) {
      for (let j = 0; j < info.ascensionMaterials[i].length; ++j) {
        info.ascensionMaterials[i][j] = getMaterialNameByID(info.ascensionMaterials[i][j]);
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

    info.mainStat = mData.weapon.manual[mainStat];
    info.mainValue = parseFloat(mData.weapon.curve[90 - 1][mainValue]) * parseFloat(mainValueBase);

    if (mainValueBase < 1) {
      info.mainValue *= 100;
    }

    info.mainValue = String(info.mainValue);

    if (mainValueBase < 1) {
      info.mainValue = `${info.mainValue}%`;
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
    const materialInfo = await getJsonObj(`${mApiPrefix}/CHS/material/${aUpgradeMaterial}`, (e) => e, true);
    const days = Object.values(Object.values(materialInfo.source).filter((c) => undefined !== c.days)[0].days).map(
      (c) => mDayOfWeekCN[c.toLowerCase()]
    );

    info.time = `【周${days.join("/")}】`;

    console.log("成功");
    return info;
  } catch (e) {
    console.log("失败");
    throw e;
  }
}

function writeData(name, data = {}) {
  const dir = mkdir(path.resolve(global.rootdir, "resources_custom", "Version2", "info", "docs"));
  const file = path.resolve(dir, `${name}.json`);
  let old = {};

  process.stdout.write(`写入文件 ${file} ……\t`);

  if (undefined === data || 0 == Object.keys(data)) {
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
        type: "string",
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

  for (const n of argv.name.filter((c) => "" !== c)) {
    try {
      const info = (await parseWeaponInfo(n)) || (await parseCharInfo(n));

      if (undefined === info) {
        console.log(`没有找到名为【${n}】的角色或武器。`);
        continue;
      }

      writeData(n, info);
    } catch (e) {
      console.log(`为【${n}】生成描述文件失败，跳过。\n错误的详细信息见下。\n${e.stack}`);
      errcode = -1;
    }
  }

  return errcode;
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
