import { update, get, push } from "./database.js";

function isMaster(userID) {
  return userID === master;
}

async function sendPrompt(sendID, userID, name, auth, type) {
  await bot.sendMessage(
    sendID,
    `[CQ:at,qq=${userID}] 您当前无${auth}权限。`,
    type
  );
}

async function setAuth(auth, target, isOn) {
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
}

async function hasAuth(userID, auth) {
  let data = await get("authority", "user", { userID });
  return data === undefined || data[auth] === undefined || data[auth] === true;
}

export { isMaster, sendPrompt, setAuth, hasAuth };
