import imageCache from "image-cache";
import url from "url";
import path from "path";
import { hasEntrance } from "../../utils/config.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function Plugin(Message, bot) {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = "group" === type ? groupID : userID;
  let cacheDir = path.join(
    path.resolve(__dirname, "..", "..", "..", "data", "image", "material"),
    "/"
  );
  let weaponURL =
    "https://upload-bbs.mihoyo.com/upload/2021/09/01/75833613/252ef04dceaf14e0f2a7f2a4bff505ba_7296608011964896512.png";
  let talentURL =
    "https://upload-bbs.mihoyo.com/upload/2021/09/01/75833613/b99595a6030c285a556117c220b9bcde_5428581671541209105.png";
  let weeklyURL =
    "https://upload-bbs.mihoyo.com/upload/2021/09/01/75833613/a9e9053f6463eeeb877e8f005308f06e_7792132300760355574.png";
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
