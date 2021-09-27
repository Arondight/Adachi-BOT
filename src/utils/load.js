import fs from "fs";
import url from "url";
import path from "path";
import { hasAuth } from "./auth.js";
import { getRandomInt } from "./tools.js";
import { loadYML } from "./yaml.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandConfig = loadYML("command");

async function loadPlugins() {
  let plugins = {};
  const pluginsPath = fs.readdirSync(path.resolve(__dirname, "..", "plugins"));

  for (let plugin of pluginsPath) {
    try {
      plugins[plugin] = await import(`../plugins/${plugin}/index.js`);
      bot.logger.debug(`插件：加载 ${plugin} 成功。`);
    } catch (error) {
      bot.logger.debug(`插件：加载 ${plugin} 失败（${error}）。`);
    }
  }

  return plugins;
}

function getCommand(msgData) {
  if (commandConfig) {
    for (let command in commandConfig) {
      if (commandConfig.hasOwnProperty(command)) {
        for (let setting of commandConfig[command]) {
          let reg = new RegExp(setting, "i");

          if (reg.test(msgData)) {
            return command;
          }
        }
      }
    }
  }

  return undefined;
}

async function processed(qqData, plugins, type) {
  // 如果好友增加了，向新朋友问好
  if (type === "friend.increase") {
    if (config.friendGreetingNew) {
      bot.sendMessage(qqData.user_id, config.greetingNew, "private");
    }

    return;
  }

  if (type === "group.increase") {
    if (bot.uin == qqData.user_id) {
      // 如果加入了新群，向全群问好
      bot.sendMessage(qqData.group_id, config.greetingHello, "group");
    } else {
      // 如果有新群友加入，向新群友问好
      if (
        config.groupGreetingNew &&
        (await hasAuth(qqData.group_id, "reply"))
      ) {
        bot.sendMessage(
          qqData.group_id,
          `[CQ:at,qq=${qqData.user_id}] ${config.greetingNew}`,
          "group"
        );
      }
    }

    return;
  }

  // 如果响应群消息，而且收到的信息是命令，指派插件处理命令
  if (
    (await hasAuth(qqData.group_id, "reply")) &&
    (await hasAuth(qqData.user_id, "reply")) &&
    qqData.hasOwnProperty("message") &&
    qqData.message[0] &&
    qqData.message[0].type === "text"
  ) {
    const command = getCommand(qqData.raw_message);

    if (command) {
      plugins[command].run({ ...qqData, type });
      return;
    }
  }

  // 如果不是命令，且为群消息，随机复读群消息
  if ("group" === type) {
    if (getRandomInt(100) < config.repeatProb) {
      bot.sendMessage(qqData.group_id, qqData.raw_message, "group");
    }

    return;
  }

  // 如果是机器人上线，所有群发送一遍上线通知
  if ("online" === type) {
    if (config.groupHello) {
      bot.gl.forEach(async (group) => {
        let info = (await bot.getGroupInfo(group.group_id)).data;
        let greeting = (await hasAuth(group.group_id, "reply"))
          ? config.greetingOnline
          : config.greetingDie;

        // 禁言时不发送消息
        // https://github.com/Arondight/Adachi-BOT/issues/28
        if (0 === info.shutup_time_me && "string" === typeof greeting) {
          bot.sendMessage(group.group_id, greeting, "group");
        }
      });
    }

    return;
  }
}

export { loadPlugins, processed };
