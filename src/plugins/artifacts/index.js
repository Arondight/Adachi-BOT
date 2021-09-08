const { getArtifact, domainInfo, domainMax } = require("./artifacts.js");
const { get, isInside, push } = require("../../utils/database");
const { hasAuth, sendPrompt } = require("../../utils/auth");
const { render } = require("../../utils/render");

const userInitialize = async (userID) => {
  if (!(await isInside("artifact", "user", "userID", userID))) {
    await push("artifact", "user", {
      userID,
      initial: {},
      fortified: {},
    });
  }
};

module.exports = async (Message) => {
  let msg = Message.raw_message;
  let userID = Message.user_id;
  let groupID = Message.group_id;
  let type = Message.type;
  let sendID = type === "group" ? groupID : userID;
  let name = Message.sender.nickname;
  let [cmd, arg] = msg.split(/(?<=^\S+)\s/).slice(0, 2);
  let data, id;

  await userInitialize(userID);

  if (
    !(await hasAuth(userID, "artifact")) ||
    !(await hasAuth(sendID, "artifact"))
  ) {
    await sendPrompt(sendID, userID, name, "抽取圣遗物", type);
    return;
  }

  if (arg == null) {
    if (cmd.includes("强化")) {
      const { initial, fortified } = await get("artifact", "user", { userID });
      if (JSON.stringify(initial) !== "{}") {
        data = fortified;
      } else {
        await bot.sendMessage(
          sendID,
          `[CQ:at,qq=${userID}] 请先使用【圣遗物】抽取一个圣遗物后再【强化】。`,
          type
        );
        return;
      }
    } else if (cmd.includes("圣遗物")) {
      await getArtifact(userID, -1);
      data = (await get("artifact", "user", { userID })).initial;
    } else if (cmd.includes("副本")) {
      await bot.sendMessage(sendID, domainInfo(), type);
      return;
    }
  } else {
    id = arg.match(/\d+/g);

    if (id && id < domainMax() + 1) {
      await getArtifact(userID, parseInt(id));
      data = (await get("artifact", "user", { userID })).initial;
    } else {
      await bot.sendMessage(
        sendID,
        `[CQ:at,qq=${userID}] 请正确输入副本ID，可以使用【副本】查看所有副本ID。`,
        type
      );
      return;
    }
  }

  await render(data, "genshin-artifact", sendID, type);
};
