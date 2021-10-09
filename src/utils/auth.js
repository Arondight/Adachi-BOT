import db from "./database.js";

async function sendPrompt(sendID, userID, name, auth, type, bot) {
  await bot.sendMessage(sendID, `您当前无${auth}权限。`, type, userID);
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

export { sendPrompt, setAuth, hasAuth };
