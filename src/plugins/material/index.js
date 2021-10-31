/* global rootdir */
/* eslint no-undef: "error" */

import path from "path";
import { hasEntrance } from "../../utils/config.js";
import { getCache } from "../../utils/cache.js";

const getUrl = (filepath) =>
  `https://upload-bbs.mihoyo.com/upload/${
    "/" === filepath[0] ? filepath.substring(1) : filepath
  }`;
const urls = {
  weapon: getUrl(
    "/2021/10/13/75379475/b56eedc27bbaf530dd3c523b1105e74b_7322607822838656788.png"
  ),
  talent: getUrl(
    "/2021/09/21/75833613/db0f03fcfb1b4afb6238e7ce8bb12a95_5543274064496215355.png"
  ),
  weekly: getUrl(
    "/2021/09/21/75833613/f6b05ab0563fc7a8404b7906d8a67707_8883237440326538461.png"
  ),
};

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const cacheDir = path.resolve(rootdir, "data", "image", "material");
  let url = urls.weekly;

  switch (true) {
    case hasEntrance(msg, "material", "weapon"):
      url = urls.weapon;
      break;
    case hasEntrance(msg, "material", "talent"):
      url = urls.talent;
      break;
    case hasEntrance(msg, "material", "weekly"):
      url = urls.weekly;
      break;
  }

  const data = await getCache(url, cacheDir, "base64");
  const text = `[CQ:image,file=base64://${data}]`;
  await bot.sendMessage(sendID, text, type, userID);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
