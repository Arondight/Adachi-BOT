const imageCache = require("image-cache");
const path = require("path");

module.exports = async (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let name = Message.sender.nickname;
  let sendID = type === "group" ? groupID : userID;
  let cacheDir = path.join(
    path.resolve(__dirname, "..", "..", "..", "data", "image", "material"),
    "/"
  );
  let weaponURL =
    "https://upload-bbs.mihoyo.com/upload/2021/08/10/75833613/192b2ab65c0af9b5d3659a6082651d78_3913787346557107046.png";
  let talentURL =
    "https://upload-bbs.mihoyo.com/upload/2021/08/10/75833613/79c2de06b8c3f58215cddf3cf59020bf_1738298545314725111.png";
  let weeklyURL =
    "https://upload-bbs.mihoyo.com/upload/2021/08/10/75833613/30666c4703cf601f53df15adb41dc621_1100661652843678873.png";
  let thisURL = weeklyURL;

  imageCache.setOptions({
    dir: cacheDir,
    compressed: false,
    googleCache: false,
  });

  switch (true) {
    case msg.includes("武器"):
      thisURL = weaponURL;
      break;
    case msg.includes("天赋"):
      thisURL = talentURL;
      break;
    case msg.includes("周本"):
      thisURL = weeklyURL;
      break;
  }

  imageCache.fetchImages(thisURL).then(async (image) => {
    data = image.data.substr(image.data.indexOf(",") + 1);
    await bot.sendMessage(
      sendID,
      "[CQ:image,file=base64://" + data + "]",
      type
    );
  });
};
