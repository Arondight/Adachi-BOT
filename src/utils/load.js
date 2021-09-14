import { hasAuth } from "./auth.js";
import { getRandomInt } from "./tools.js";
import yaml from "js-yaml";
import fs from "fs";
import url from "url";
import path from "path";
import module from "module";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = module.createRequire(import.meta.url);

function loadYML(name) {
  return yaml.load(fs.readFileSync(`./config/${name}.yml`, "utf-8"));
}

async function loadPlugins() {
  let plugins = {};
  const pluginsPath = fs.readdirSync(path.resolve(__dirname, "..", "plugins"));

  for (let plugin of pluginsPath) {
    try {
      plugins[plugin] = await import(`../plugins/${plugin}/index.js`);
    } catch (error) {
      bot.logger.error(`插件 ${plugin} 加载失败：${error}`);
    }
    bot.logger.info(`插件 ${plugin} 加载完成`);
  }

  return plugins;
}

function getCommand(msgData) {
  const commandConfig = loadYML("command");

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

  return null;
}

async function processed(qqData, plugins, type) {
  // 如果好友增加了，向新朋友问好
  if (type === "friend.increase") {
    if (friendGreetingNew) {
      bot.sendMessage(qqData.user_id, greetingNew, "private");
    }

    return;
  }

  if (type === "group.increase") {
    if (bot.uin == qqData.user_id) {
      // 如果加入了新群，向全群问好
      bot.sendMessage(qqData.group_id, greetingHello, "group");
    } else {
      // 如果有新群友加入，向新群友问好
      if (groupGreetingNew) {
        bot.sendMessage(
          qqData.group_id,
          `[CQ:at,qq=${qqData.user_id}] ${greetingNew}`,
          "group"
        );
      }
    }

    return;
  }

  // 如果响应群消息，而且收到的信息是命令，指派插件处理命令
  if (
    (await hasAuth(qqData.group_id, "replyGroup")) &&
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
  if (type === "group") {
    if (getRandomInt(100) < repeatProb) {
      bot.sendMessage(qqData.group_id, qqData.raw_message, "group");
    }

    return;
  }

  // 如果是机器人上线，所有群发送一遍上线通知
  if (type === "online") {
    if (groupHello) {
      bot.gl.forEach(async (group) => {
        let greeting = (await hasAuth(group.group_id, "replyGroup"))
          ? greetingOnline
          : greetingDie;
        bot.sendMessage(group.group_id, greeting, "group");
      });
    }

    return;
  }
}

export { loadYML, loadPlugins, processed };
