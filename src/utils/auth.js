/* global command */
/* eslint no-undef: "error" */

import db from "./database.js";

async function hasAuth(id, func) {
  const data = (await db.get("authority", "user", { userID: id })) || {};
  return data[func] && true === data[func];
}

async function setAuth(msg, func, id, isOn, report = true) {
  const name = command.functions.name[func] ? `【${command.functions.name[func]}】` : func;
  const text = `我已经开始${isOn ? "允许" : "禁止"} ${id} 的${name}功能！`;
  const data = await db.get("authority", "user", { userID: id });

  if (undefined === data) {
    await db.push("authority", "user", { userID: id, [func]: isOn });
  } else {
    await db.update("authority", "user", { userID: id }, { ...data, [func]: isOn });
  }

  if (true === report && undefined !== msg.bot) {
    await msg.bot.sayMaster(msg.sid, text, msg.type, msg.uid);
  }
}

// 返回值：
//    true:      有权限
//    false:     没权限
//    undefined: 没设置权限
async function checkAuth(msg, func, report = true) {
  const uauth = await hasAuth(msg.uid, func);
  const gauth = await hasAuth(msg.sid, func);

  if (undefined == uauth && undefined === gauth) {
    return undefined;
  }

  if (false === uauth || false === gauth) {
    if (true === report && undefined !== msg.bot) {
      await msg.bot.say(msg.sid, `您当前无【${command.functions.name[func]}】权限。`, msg.type, msg.uid);
    }
    return false;
  }

  return true;
}

export { setAuth, checkAuth };
