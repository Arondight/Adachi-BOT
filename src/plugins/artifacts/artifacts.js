/* global artifacts, command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { getArtifact, domainMax } from "./data.js";
import { init } from "./init.js";

async function doArtifacts(msg) {
  const arg = (msg.text.split(/(?<=^\S+)\s/).slice(0, 2) || [])[1];
  let id;
  let data;

  await init(msg.uid);

  if ("string" === typeof arg) {
    id = (arg.match(/\d+/g) || [])[0];
  }

  if (undefined === arg) {
    await getArtifact(msg.uid, -1);
    data = ((await db.get("artifact", "user", { userID: msg.uid })) || {}).initial;
  } else {
    if (undefined === id) {
      const text = arg.toLowerCase();
      const name = artifacts.domains.alias[text] || text;
      id = artifacts.domains.id[name];
    }

    if (undefined !== id && id < domainMax() + 1) {
      await getArtifact(msg.uid, parseInt(id));
      data = ((await db.get("artifact", "user", { userID: msg.uid })) || {}).initial;
    } else {
      const text = `请正确输入副本，可以使用【${command.functions.name.dungeons}】查看所有副本。`;
      await msg.bot.say(msg.sid, text, msg.type, msg.uid);
      return;
    }
  }

  await render(data, "genshin-artifact", msg.sid, msg.type, msg.uid, msg.bot, 1.2);
}

export { doArtifacts };
