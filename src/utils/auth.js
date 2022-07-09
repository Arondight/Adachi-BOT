import lodash from "lodash";
import db from "#utils/database";
import { isGroup } from "#utils/oicq";

function hasAuth(id, func) {
  const data = db.get("authority", "user", { userID: id }) || {};
  return data[func] && true === data[func];
}

function setAuth(msg, funcs = [], id, isOn, report = true) {
  const names = [];
  const isMaster = global.config.masters.includes(id);
  const type = isGroup(msg.bot, id) ? "group" : "private";
  let on = isOn;

  if (!Array.isArray(funcs)) {
    funcs = [funcs];
  }

  if (true === isMaster) {
    on = true;
  }

  funcs.forEach((f) => {
    const data = db.get("authority", "user", { userID: id });
    let name = global.command.functions.name[f] || f;

    if ("option" === global.all.functions.type[f] && true === global.all.functions.revert[f]) {
      if (global.all.functions.options[f]) {
        name = `${lodash.flatten(Object.values(global.all.functions.options[f])).join("、")}${name}`;
      }
    }

    names.push(`【${name}】`);

    if (undefined === data) {
      db.push("authority", "user", { userID: id, [f]: on });
    } else {
      db.update("authority", "user", { userID: id }, { ...data, [f]: on });
    }
  });

  if (true === report && undefined !== msg.bot) {
    if (true === isMaster && false === isOn) {
      msg.bot.say(id, `不禁止管理者 ${id} 的权限！`, type);
      return;
    }

    const formatter = `我已经开始${on ? "允许" : "禁止"} {} 的${names.join("")}功能！`;

    msg.bot.sayMaster(msg.sid, formatter.replace("{}", id), msg.type, msg.uid);
    msg.bot.say(id, formatter.replace("{}", "您"), type);
  }
}

// 返回值：
//    true:   有权限
//    false:  没权限
function checkAuth(msg, func, report = true, checkMaster = false) {
  function getAuth() {
    const uauth = hasAuth(msg.uid, func);
    const gauth = hasAuth(msg.sid, func);

    if (undefined === uauth && undefined === gauth) {
      return true === global.authority.default[global.authority.function[func]];
    }

    return false !== uauth && false !== gauth;
  }

  const res = (false === checkMaster && global.config.masters.includes(msg.uid)) || getAuth();
  let name = global.command.functions.name[func];

  if (false === res && true === report && undefined !== msg.bot) {
    if ("option" === global.all.functions.type[func] && true === global.all.functions.revert[func]) {
      if (global.all.functions.options[func]) {
        name = `${lodash.flatten(Object.values(global.all.functions.options[func])).join("、")}${name}`;
      }
    }

    msg.bot.say(msg.sid, `您当前无【${name}】权限。`, msg.type, msg.uid, true);
  }

  return res;
}

export { checkAuth, setAuth };
