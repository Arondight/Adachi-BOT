const { update, get, push } = require("./database");

exports.isMaster = (userID) => {
  return userID === master;
};

exports.sendPrompt = async (sendID, userID, name, auth, type) => {
  await bot.sendMessage(sendID, `[CQ:at,qq=${userID}] 您当前无${auth}权限`, type);
};

exports.setAuth = async (auth, target, isOn) => {
  let data = await get("authority", "user", { userID: target });
  if (data === undefined) {
    await push("authority", "user", { userID: target, [auth]: isOn });
  } else {
    await update(
      "authority",
      "user",
      { userID: target },
      { ...data, [auth]: isOn }
    );
  }
};

exports.hasAuth = async (userID, auth) => {
  let data = await get("authority", "user", { userID });
  return data === undefined || data[auth] === undefined || data[auth] === true;
};
