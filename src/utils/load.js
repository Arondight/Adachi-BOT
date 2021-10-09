import fs from "fs";
import url from "url";
import path from "path";
import { hasAuth } from "./auth.js";
import { getRandomInt } from "./tools.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadPlugins() {
  let plugins = {};
  const pluginsPath = fs.readdirSync(path.resolve(__dirname, "..", "plugins"));
  const enableList = { ...command.enable, ...master.enable };

  for (let plugin of pluginsPath) {
    if (plugin in all.function) {
      if (enableList[plugin] && true === enableList[plugin]) {
        try {
          plugins[plugin] = await import(`../plugins/${plugin}/index.js`);
          bots[0] && bots[0].logger.debug(`插件：加载 ${plugin} 成功。`);
        } catch (error) {
          bots[0] &&
            bots[0].logger.error(`插件：加载 ${plugin} 失败（${error}）。`);
        }
      } else {
        bots[0] &&
          bots[0].logger.warn(`插件：拒绝加载被禁用的插件 ${plugin} ！`);
      }
    } else {
      bots[0] && bots[0].logger.warn(`插件：拒绝加载未知插件 ${plugin} ！`);
    }
  }

  return plugins;
}

async function processed(qqData, plugins, type, bot) {
  // 如果好友增加了，尝试向新朋友问好
  if (type === "friend.increase") {
    if (config.friendGreetingNew) {
      // 私聊不需要 @
      bot.sendMessage(qqData.user_id, config.greetingNew, "private");
    }

    return;
  }

  if (type === "group.increase") {
    if (bot.uin === qqData.user_id) {
      // 如果加入了新群，向全群问好
      // 群 通知不需要 @
      bot.sendMessage(qqData.group_id, config.greetingHello, "group");
    } else {
      // 如果有新群友加入，尝试向新群友问好
      if (
        config.groupGreetingNew &&
        (await hasAuth(qqData.group_id, "reply"))
      ) {
        bot.sendMessage(
          qqData.group_id,
          config.greetingNew,
          "group",
          qqData.user_id
        );
      }
    }

    return;
  }

  // 收到的信息是命令，尝试指派插件处理命令
  if (
    (await hasAuth(qqData.group_id, "reply")) &&
    (await hasAuth(qqData.user_id, "reply")) &&
    qqData.hasOwnProperty("message") &&
    qqData.message[0] &&
    qqData.message[0].type === "text"
  ) {
    const regexPool = { ...command.regex, ...master.regex };
    const enableList = { ...command.enable, ...master.enable };

    for (let regex in regexPool) {
      const r = new RegExp(regex, "i");
      const plugin = regexPool[regex];

      if (enableList[plugin] && r.test(qqData.raw_message)) {
        // 只允许管理者执行主人命令
        if (master.enable[plugin] && !config.masters.includes(qqData.user_id)) {
          const id = "group" === type ? qqData.group_id : qqData.user_id;
          await bot.sendMessage(id, "不能使用管理命令。", type, qqData.user_id);
          return;
        }

        plugins[plugin].run({ ...qqData, type }, bot);
        return;
      }
    }
  }

  // 如果不是命令，且为群消息，随机复读群消息
  if ("group" === type) {
    if (getRandomInt(100) < config.repeatProb) {
      // 复读群消息不需要 @
      bot.sendMessage(qqData.group_id, qqData.raw_message, "group");
    }

    return;
  }

  // 如果是机器人上线，尝试所有群发送一遍上线通知
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
          // 群通知不需要 @
          bot.sendMessage(group.group_id, greeting, "group");
        }
      });
    }

    return;
  }
}

export { loadPlugins, processed };
