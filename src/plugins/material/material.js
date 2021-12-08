import path from "path";
import lodash from "lodash";
import { getCache } from "../../utils/cache.js";
import { render } from "../../utils/render.js";

const getUrl = (p) => `https://upload-bbs.mihoyo.com/upload/${"/" === p[0] ? p.substring(1) : p}`;
const urls = {
  talent: getUrl("/2021/09/21/75833613/db0f03fcfb1b4afb6238e7ce8bb12a95_5543274064496215355.png"), // 当前只判断 boolean ，无实际作用，无需更新
  weekly: getUrl("/2021/09/21/75833613/f6b05ab0563fc7a8404b7906d8a67707_8883237440326538461.png"),
};

async function doMaterial(msg, url) {
  const cacheDir = path.resolve(global.rootdir, "data", "image", "material");

  if (url === urls.weekly) {
    const data = await getCache(url, cacheDir, "base64");
    const text = `[CQ:image,file=base64://${data}]`;
    msg.bot.say(msg.sid, text, msg.type, msg.uid);
    return;
  }

  const dayOfWeek = new Date().getDay();
  const materialList = {
    1: "MonThu",
    2: "TueFri",
    3: "WedSat",
    4: "MonThu",
    5: "TueFri",
    6: "WedSat",
  };

  if (undefined === materialList[dayOfWeek]) {
    msg.bot.say(msg.sid, "今天所有副本开放，没有可刷素材限制。", msg.type, msg.uid);
    return;
  }

  const character = { type: "character", data: [] };
  const weapon = { type: "weapon", data: [] };
  const items = {
    character: global.info.character.filter((c) => (global.material[materialList[dayOfWeek]] || []).includes(c.name)),
    weapon: global.info.weapon.filter((c) => (global.material[materialList[dayOfWeek]] || []).includes(c.name)),
  };
  const ascensions = { character: [], weapon: [] };

  items.character.forEach((c) => {
    const ascension = lodash.cloneDeep(lodash.take(c.talentMaterials || [], 3));
    let hasIn = false;

    for (let i = 0; i < ascensions.character.length; ++i) {
      if (lodash.isEqual(ascensions.character[i], ascension)) {
        hasIn = true;
        break;
      }
    }

    if (false === hasIn) {
      ascensions.character.push(ascension);
    }
  });

  items.weapon.forEach((c) => {
    const ascension = lodash.cloneDeep(lodash.take(c.ascensionMaterials[0] || [], 3));
    let hasIn = false;

    for (let i = 0; i < ascensions.weapon.length; ++i) {
      if (lodash.isEqual(ascensions.weapon[i], ascension)) {
        hasIn = true;
        break;
      }
    }

    if (false === hasIn) {
      ascensions.weapon.push(ascension);
    }
  });

  ascensions.character.forEach((n) => {
    const record = { ascension: n, list: [] };

    items.character.forEach((c) => {
      const ascension = lodash.take(c.talentMaterials || [], 3);

      if (lodash.isEqual(ascension, n)) {
        record.list.push({ name: c.name, rarity: c.rarity });
      }
    });

    character.data.push(record);
  });

  ascensions.weapon.forEach((n) => {
    const record = { ascension: n, list: [] };

    items.weapon.forEach((c) => {
      const ascension = lodash.take(c.ascensionMaterials[0] || [], 3);

      if (lodash.isEqual(ascension, n)) {
        record.list.push({ name: c.name, rarity: c.rarity });
      }
    });

    weapon.data.push(record);
  });

  render(msg, { character, weapon }, "genshin-material");
}

export { doMaterial, urls };
