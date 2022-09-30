import lodash from "lodash";
import moment from "moment-timezone";
import path from "path";
import { getCache } from "#utils/cache";
import { render } from "#utils/render";
import { getWordByRegex } from "#utils/tools";

("use strict");

// 如果注释中的链接失效，尝试在米游社中搜索用户“好多梨”。
// 周本图，包括天赋、武器、世界BOSS
const m_URL = Object.freeze({
  // https://bbs.mihoyo.com/ys/obc/content/1226/detail
  talent: getUrl("/2022/09/28/75833613/7dd84fc0c362454388657aa4500072a4_5765589602624912314.png"),
  // https://bbs.mihoyo.com/ys/obc/content/1187/detail
  weapon: getUrl("/2022/09/28/75833613/43a36f7300eeb17767fd8e708cedd708_6341294669712434358.png"),
  // https://bbs.mihoyo.com/ys/obc/content/1226/detail
  weekly: getUrl("/2022/09/28/75833613/2b51fe5722a73b14891224d7b57d86fa_7881678352326384999.png"),
});

function getUrl(p) {
  return `https://uploadstatic.mihoyo.com/ys-obc/${"/" === p[0] ? p.substring(1) : p}`;
}

async function doMaterial(msg, url) {
  const cacheDir = path.resolve(global.datadir, "image", "material");

  if ([m_URL.talent, m_URL.weapon, m_URL.weekly].includes(url)) {
    const data = await getCache(url, cacheDir, "base64");
    const text = `[CQ:image,type=image,file=base64://${data}]`;
    msg.bot.say(msg.sid, text, msg.type, msg.uid);
    return;
  }

  const materialList = { 1: "MonThu", 2: "TueFri", 3: "WedSat", 4: "MonThu", 5: "TueFri", 6: "WedSat" };
  const dayOfZhou = ["日", "一", "二", "三", "四", "五", "六"].map((c) => `周${c}`);
  const [day] = getWordByRegex(msg.text, ".{2}");
  const serverWeekday = moment().tz("Asia/Shanghai").subtract(4, "hours").weekday();
  const dayOfWeek = dayOfZhou.includes(day) ? dayOfZhou.indexOf(day) : serverWeekday;

  if (undefined === materialList[dayOfWeek]) {
    msg.bot.say(msg.sid, `${day}所有副本都可以刷哦。`, msg.type, msg.uid, true);
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

  items.weapon
    .filter((c) => "number" === typeof c.rarity && c.rarity > 2)
    .forEach((c) => {
      const ascension = lodash.cloneDeep(lodash.take(c.ascensionMaterials[0] || [], 4));
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
      const ascension = lodash.take(c.ascensionMaterials[0] || [], 4);

      if (lodash.isEqual(ascension, n)) {
        record.list.push({ name: c.name, rarity: c.rarity });
      }
    });

    weapon.data.push(record);
  });

  render(msg, { day, character, weapon }, "genshin-material");
}

export { doMaterial, m_URL as url };
