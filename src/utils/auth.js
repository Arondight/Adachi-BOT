import db from "#utils/database";

function hasAuth(id, func) {
  const data = db.get("authority", "user", { userID: id }) || {};
  return data[func] && true === data[func];
}

function setAuth(msg, funcs = [], id, isOn, report = true) {
  const names = [];

  if (!Array.isArray(funcs)) {
    funcs = [funcs];
  }

  // TODO
  // 1. 检查是否为好友或者群
  // 2. 也给对方一个通知
  funcs.forEach((f) => {
    const name = global.command.functions.name[f] ? `【${global.command.functions.name[f]}】` : f;
    const data = db.get("authority", "user", { userID: id });

    names.push(name);

    if (undefined === data) {
      db.push("authority", "user", { userID: id, [f]: isOn });
    } else {
      db.update("authority", "user", { userID: id }, { ...data, [f]: isOn });
    }
  });

  if (true === report && undefined !== msg.bot) {
    const text = `我已经开始${isOn ? "允许" : "禁止"} ${id} 的${names.join("")}功能！`;
    msg.bot.sayMaster(msg.sid, text, msg.type, msg.uid);
  }
}

// 返回值：
//    true:      有权限
//    false:     没权限
//    undefined: 没设置权限
function checkAuth(msg, func, report = true) {
  const uauth = hasAuth(msg.uid, func);
  const gauth = hasAuth(msg.sid, func);

  if (undefined === uauth && undefined === gauth) {
    return undefined;
  }

  if (false === uauth || false === gauth) {
    if (true === report && undefined !== msg.bot) {
      msg.bot.say(msg.sid, `您当前无【${global.command.functions.name[func]}】权限。`, msg.type, msg.uid, true);
    }
    return false;
  }

  return true;
}

export { checkAuth, setAuth };
