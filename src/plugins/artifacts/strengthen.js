/* global command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { init } from "./init.js";

function doStrengthen(msg) {
  let data;

  init(msg.uid);

  const { initial, fortified } = db.get("artifact", "user", { userID: msg.uid }) || {};

  if (JSON.stringify(initial) !== "{}") {
    data = fortified;
  } else {
    const text = `请先使用【${command.functions.name.artifacts}】抽取一个圣遗物后再【${command.functions.name.strengthen}】。`;
    msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
    return;
  }

  render(msg, data, "genshin-artifact");
}

export { doStrengthen };
