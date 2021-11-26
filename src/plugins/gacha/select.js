import lodash from "lodash";
import db from "../../utils/database.js";
import { init } from "./init.js";

function doSelect(msg, name) {
  init(msg.uid);

  const { choice } = db.get("gacha", "user", { userID: msg.uid }) || {};

  if (choice !== 302) {
    msg.bot.say(msg.sid, "当前非武器卡池无法进行定轨。", msg.type, msg.uid, true);
    return;
  }

  const table = db.get("gacha", "data", { gacha_type: 302 }) || {};
  name = global.names.weaponAlias[name] || name;

  if (name && lodash.find(table.upFiveStar, { item_name: name })) {
    msg.bot.say(msg.sid, `定轨${name}成功，命定值已清零。`, msg.type, msg.uid, true);
    const path = {
      course: lodash.findIndex(table.upFiveStar, { item_name: name }),
      fate: 0,
    };
    db.update("gacha", "user", { userID: msg.uid }, { path });
  } else {
    const text = `请从当前 UP 武器${lodash.map(table.upFiveStar, "item_name").join("、")}中选择一个进行定轨。`;
    msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
  }
}

function doSelectWhat(msg) {
  init(msg.uid);

  const { choice } = db.get("gacha", "user", { userID: msg.uid }) || {};

  if (choice !== 302) {
    msg.bot.say(msg.sid, "当前非武器卡池无法查看定轨。", msg.type, msg.uid, true);
    return;
  }

  const table = db.get("gacha", "data", { gacha_type: 302 }) || {};
  const { path } = db.get("gacha", "user", { userID: msg.uid }) || {};

  if (null === path.course) {
    msg.bot.say(msg.sid, "当前未指定定轨武器。", msg.type, msg.uid, true);
  } else {
    const text = `当前定轨${table.upFiveStar[path.course].item_name}，命定值为 ${path.fate} 。`;
    msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
  }
}

function doSelectNothing(msg) {
  const path = { course: null, fate: 0 };

  init(msg.uid);
  db.update("gacha", "user", { userID: msg.uid }, { path });
  msg.bot.say(msg.sid, "已取消定轨。", msg.type, msg.uid, true);
}

export { doSelect, doSelectNothing, doSelectWhat };
