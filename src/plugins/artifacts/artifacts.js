/* global artifacts, command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";
import { render } from "../../utils/render.js";
import { domainMax, getArtifact } from "./data.js";
import { init } from "./init.js";

function doArtifacts(msg) {
  const [arg] = getWordByRegex(filterWordsByRegex(msg.text, ...command.functions.entrance.artifacts), /\S+/);
  let id;
  let data;

  init(msg.uid);

  if ("string" === typeof arg) {
    id = (arg.match(/\d+/g) || [])[0];
  }

  if (undefined === arg) {
    getArtifact(msg.uid, -1);
    data = (db.get("artifact", "user", { userID: msg.uid }) || {}).initial;
  } else {
    if (undefined === id) {
      const text = arg.toLowerCase();
      const name = artifacts.domains.alias[text] || text;
      id = artifacts.domains.id[name];
    }

    if (undefined !== id && id < domainMax() + 1) {
      getArtifact(msg.uid, parseInt(id));
      data = (db.get("artifact", "user", { userID: msg.uid }) || {}).initial;
    } else {
      const text = `请正确输入副本，可以使用【${command.functions.name.dungeons}】查看所有副本。`;
      msg.bot.say(msg.sid, text, msg.type, msg.uid, true);
      return;
    }
  }

  render(msg, data, "genshin-artifact");
}

export { doArtifacts };
