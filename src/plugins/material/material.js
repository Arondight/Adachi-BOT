import lodash from "lodash";
import moment from "moment-timezone";
import path from "path";
import { getCache } from "#utils/cache";
import { render } from "#utils/render";
import { getWordByRegex } from "#utils/tools";

("use strict");

// 观测枢最底部“索引分类”中“WIKI索引”，点击“角色天赋材料周常表”和“武器突破材料周常表”
// https://bbs.mihoyo.com/ys/strategy/
const m_URL = Object.freeze({
  // 角色天赋
  // https://bbs.mihoyo.com/ys/obc/content/1226/detail
  talent: getUrl("/2022/10/13/75833613/25f724446b2ca7667aaff7638baa8240_8990270834497776161.png"),
  // 武器素材
  // https://bbs.mihoyo.com/ys/obc/content/1187/detail
  weapon: getUrl("/2022/10/13/75833613/2e8dbac2ca65c6752fad93ef3c27990b_8978158381690391867.png"),
  // 周本掉落
  // https://bbs.mihoyo.com/ys/obc/content/1226/detail
  weekly: getUrl("/2022/10/13/75833613/7cf877114c7229273ae493b51620aba2_4373087575235336466.png"),
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
