import db from "./database.js";

function isMaster(userID) {
  return config.masters.includes(userID);
}

async function sendPrompt(sendID, userID, name, auth, type) {
  await bot.sendMessage(
    sendID,
    `[CQ:at,qq=${userID}] 您当前无${auth}权限。`,
    type
  );
}

async function setAuth(auth, target, isOn) {
  let data = await db.get("authority", "user", { userID: target });

  if (undefined === data) {
    await db.push("authority", "user", { userID: target, [auth]: isOn });
  } else {
    await db.update(
      "authority",
      "user",
      { userID: target },
      { ...data, [auth]: isOn }
    );
  }
}

async function hasAuth(userID, auth) {
  let data = await db.get("authority", "user", { userID });
  return undefined === data || undefined === data[auth] || true === data[auth];
}

export { isMaster, sendPrompt, setAuth, hasAuth };
