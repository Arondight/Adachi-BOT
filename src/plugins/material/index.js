/* global rootdir */
/* eslint no-undef: "error" */

import imageCache from "image-cache";
import path from "path";
import { hasEntrance } from "../../utils/config.js";

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const name = Message.sender.nickname;
  const sendID = "group" === type ? groupID : userID;
  const cacheDir = path.resolve(rootdir, "data", "image", "material");
  const weaponURL =
    "https://upload-bbs.mihoyo.com/upload/2021/10/13/75379475/b56eedc27bbaf530dd3c523b1105e74b_7322607822838656788.png";
  const talentURL =
    "https://upload-bbs.mihoyo.com/upload/2021/09/21/75833613/db0f03fcfb1b4afb6238e7ce8bb12a95_5543274064496215355.png";
  const weeklyURL =
    "https://upload-bbs.mihoyo.com/upload/2021/09/21/75833613/f6b05ab0563fc7a8404b7906d8a67707_8883237440326538461.png";
  let thisURL = weeklyURL;

  imageCache.setOptions({
    dir: cacheDir,
    compressed: false,
    googleCache: false,
  });

  switch (true) {
    case hasEntrance(msg, "material", "weapon"):
      thisURL = weaponURL;
      break;
    case hasEntrance(msg, "material", "talent"):
      thisURL = talentURL;
      break;
    case hasEntrance(msg, "material", "weekly"):
      thisURL = weeklyURL;
      break;
  }

  imageCache.fetchImages(thisURL).then(async (image) => {
    let data = image.data.substr(image.data.indexOf(",") + 1);
    await bot.sendMessage(
      sendID,
      `[CQ:image,file=base64://${data}]`,
      type,
      userID
    );
  });
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
