/* global rootdir */
/* eslint no-undef: "error" */

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
  const cacheDir = path.resolve(rootdir, "data", "image", "material");

  if (url) {
    const data = await getCache(url, cacheDir, "base64");
    const text = `[CQ:image,file=base64://${data}]`;
    msg.bot.say(msg.sid, text, msg.type, msg.uid);
  }
}

export { doMaterial, urls };
