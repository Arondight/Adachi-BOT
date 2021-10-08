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
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = "group" === type ? groupID : userID;
  let name = Message.sender.nickname;
  let [cmd, arg] = msg.split(/(?<=^\S+)\s/).slice(0, 2);
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
      data = (await db.get("artifact", "user", { userID })).initial;
    } else if (hasEntrance(cmd, "artifacts", "strengthen")) {
      const { initial, fortified } = await db.get("artifact", "user", {
        userID,
      });

      if (JSON.stringify(initial) !== "{}") {
        data = fortified;
      } else {
        await bot.sendMessage(
          sendID,
          `请先使用【${command.functions.entrance.artifacts[0]}】抽取一个圣遗物后再【${command.functions.entrance.strengthen[0]}】。`,
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

    let id = arg.match(/\d+/g);

    if (id && id < domainMax() + 1) {
      await getArtifact(userID, parseInt(id));
      data = (await db.get("artifact", "user", { userID })).initial;
    } else {
      await bot.sendMessage(
        sendID,
        `请正确输入副本编号，可以使用【${command.functions.entrance.dungeons[0]}】查看所有编号。`,
        type,
        userID
      );
      return;
    }
  }

  await render(data, "genshin-artifact", sendID, type, userID, bot);
}

async function Wrapper(Message, bot) {
  try {
    await Plugin(Message, bot);
  } catch (e) {
    bot.logger.error(e);
  }
}

export { Wrapper as run };
