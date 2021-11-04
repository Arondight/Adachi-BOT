/* global artifacts, command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sayAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { getArtifact, domainInfo, domainMax } from "./artifacts.js";

async function userInitialize(id) {
  if (!(await db.includes("artifact", "user", "msg", id))) {
    await db.push("artifact", "user", { userID: id, initial: {}, fortified: {} });
  }
}

async function Plugin(msg, bot) {
  const [cmd, arg] = msg.text.split(/(?<=^\S+)\s/).slice(0, 2);
  let data;

  await userInitialize(msg.uid);

  if (!(await hasAuth(msg.uid, "artifact")) || !(await hasAuth(msg.sid, "artifact"))) {
    await sayAuth(msg.sid, msg.uid, msg.name, "抽取圣遗物", msg.type, bot);
    return;
  }

  if (undefined === arg) {
    if (hasEntrance(cmd, "artifacts", "artifacts")) {
      await getArtifact(msg.uid, -1);
      data = ((await db.get("artifact", "user", { userID: msg.uid })) || {}).initial;
    } else if (hasEntrance(cmd, "artifacts", "strengthen")) {
      const { initial, fortified } = await db.get("artifact", "user", {
        userID: msg.uid,
      });

      if (JSON.stringify(initial) !== "{}") {
        data = fortified;
      } else {
        const text = `请先使用【${command.functions.name.artifacts}】抽取一个圣遗物后再【${command.functions.name.strengthen}】。`;
        await bot.say(msg.sid, text, msg.type, msg.uid);
        return;
      }
    } else if (hasEntrance(cmd, "artifacts", "dungeons")) {
      await bot.say(msg.sid, domainInfo(), msg.type, msg.uid, "\n");
      return;
    }
  } else {
    if (!hasEntrance(cmd, "artifacts", "artifacts")) {
      return;
    }

    let [id] = arg.match(/\d+/g) || [];

    if (!id) {
      const text = arg.toLowerCase();
      const name = artifacts.domains.alias[text] || text;
      id = artifacts.domains.id[name];
    }

    if (undefined !== id && id < domainMax() + 1) {
      await getArtifact(msg.uid, parseInt(id));
      data = ((await db.get("artifact", "user", { userID: msg.uid })) || {}).initial;
    } else {
      const text = `请正确输入副本，可以使用【${command.functions.name.dungeons}】查看所有副本。`;
      await bot.say(msg.sid, text, msg.type, msg.uid);
      return;
    }
  }

  await render(data, "genshin-artifact", msg.sid, msg.type, msg.uid, bot, 1.2);
}

export { Plugin as run };
