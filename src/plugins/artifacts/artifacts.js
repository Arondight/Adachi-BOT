import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { domainMax, getArtifact } from "./data.js";
import { init } from "./init.js";

function doArtifacts(msg, text = undefined) {
  let id;
  let data;

  init(msg.uid);

  if ("string" === typeof text) {
    id = (text.match(/\d+/g) || [])[0];
  }

  if (undefined === text) {
    getArtifact(msg.uid, -1);
    data = (db.get("artifact", "user", { userID: msg.uid }) || {}).initial;
  } else {
    if (undefined === id) {
      const name = global.artifacts.domains.alias[text.toLowerCase()] || text;
      id = global.artifacts.domains.id[name];
    }

    if (undefined !== id && id < domainMax() + 1) {
      getArtifact(msg.uid, parseInt(id));
      data = (db.get("artifact", "user", { userID: msg.uid }) || {}).initial;
    } else {
      const message = `请正确输入副本，可以使用【${global.command.functions.name.dungeons}】查看所有副本。`;
      msg.bot.say(msg.sid, message, msg.type, msg.uid, true);
      return;
    }
  }

  render(msg, data, "genshin-artifact");
}

export { doArtifacts };
