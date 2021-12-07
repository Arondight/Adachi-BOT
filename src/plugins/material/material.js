import path from "path";
import { getCache } from "../../utils/cache.js";

const getUrl = (filepath) =>
  `https://upload-bbs.mihoyo.com/upload/${"/" === filepath[0] ? filepath.substring(1) : filepath}`;
const urls = {
  weapon: getUrl("/2021/10/13/75379475/b56eedc27bbaf530dd3c523b1105e74b_7322607822838656788.png"),
  talent: getUrl("/2021/09/21/75833613/db0f03fcfb1b4afb6238e7ce8bb12a95_5543274064496215355.png"),
  weekly: getUrl("/2021/09/21/75833613/f6b05ab0563fc7a8404b7906d8a67707_8883237440326538461.png"),
};

async function doMaterial(msg, url) {
  const cacheDir = path.resolve(global.rootdir, "data", "image", "material");
  const dayOfWeek = new Date().getDay();
  const materialList = {
    1: "MonThu",
    2: "TueFri",
    3: "WedSat",
    4: "MonThu",
    5: "TueFri",
    6: "WedSat",
  };
  const data = { character: {}, weapon: {} };

  (global.material[materialList[dayOfWeek]] || []).forEach((n) => {
    (global.info.character.filter((c) => c.name === n) || []).forEach((c) => {
      const key = (c.talentMaterials || [])[2];
      if ("string" === typeof key) {
        (data.character[key] || (data.character[key] = [])).push(c.name);
      }
    });
    (global.info.weapon.filter((c) => c.name === n) || []).forEach((c) => {
      const key = ((c.ascensionMaterials || [])[0] || [])[2];
      if ("string" === typeof key) {
        (data.weapon[key] || (data.weapon[key] = [])).push(c.name);
      }
    });
  });

  // XXX 在能够发送今日素材 data 后，这里或许可以当做一个总体的列表提供 {
  if (url) {
    const data = await getCache(url, cacheDir, "base64");
    const text = `[CQ:image,file=base64://${data}]`;
    msg.bot.say(msg.sid, text, msg.type, msg.uid);
    return;
  }
  // }

  if (0 === Object.keys({ ...data.character, ...data.weapon }).length) {
    msg.bot.say(msg.sid, "今天所有副本开放，没有可刷素材限制。", msg.type, msg.uid);
    return;
  }

  // TODO 发送今日素材 data 给用户，可能需要调用 render
}

export { doMaterial, urls };
