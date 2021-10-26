/* global artifacts, command */
/* eslint no-undef: "error" */

import db from "../../utils/database.js";
import { render } from "../../utils/render.js";
import { hasAuth, sendPrompt } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { getArtifact, domainInfo, domainMax } from "./artifacts.js";

async function userInitialize(userID) {
  if (!(await db.includes("artifact", "user", "userID", userID))) {
    await db.push("artifact", "user", { userID, initial: {}, fortified: {} });
  }
}

async function Plugin(Message, bot) {
  const msg = Message.raw_message;
  const userID = Message.user_id;
  const groupID = Message.group_id;
  const type = Message.type;
  const sendID = "group" === type ? groupID : userID;
  const name = Message.sender.nickname;
  const [cmd, arg] = msg.split(/(?<=^\S+)\s/).slice(0, 2);
  let data;

  await userInitialize(userID);

  if (
    !(await hasAuth(userID, "artifact")) ||
    !(await hasAuth(sendID, "artifact"))
  ) {
    await sendPrompt(sendID, userID, name, "抽取圣遗物", type, bot);
    return;
  }

  if (undefined === arg) {
    if (hasEntrance(cmd, "artifacts", "artifacts")) {
      await getArtifact(userID, -1);
      data = ((await db.get("artifact", "user", { userID })) || {}).initial;
    } else if (hasEntrance(cmd, "artifacts", "strengthen")) {
      const { initial, fortified } = await db.get("artifact", "user", {
        userID,
      });

      if (JSON.stringify(initial) !== "{}") {
        data = fortified;
      } else {
        await bot.sendMessage(
          sendID,
          `请先使用【${command.functions.name.artifacts}】抽取一个圣遗物后再【${command.functions.name.strengthen}】。`,
          type,
          userID
        );
        return;
      }
    } else if (hasEntrance(cmd, "artifacts", "dungeons")) {
      await bot.sendMessage(sendID, domainInfo(), type, userID, "\n");
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
      id = artifacts.domains.name[name];
    }

    if (id && id < domainMax() + 1) {
      await getArtifact(userID, parseInt(id));
      data = ((await db.get("artifact", "user", { userID })) || {}).initial;
    } else {
      await bot.sendMessage(
        sendID,
        `请正确输入副本，可以使用【${command.functions.name.dungeons}】查看所有副本。`,
        type,
        userID
      );
      return;
    }
  }

  await render(data, "genshin-artifact", sendID, type, userID, bot, 1.2);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
