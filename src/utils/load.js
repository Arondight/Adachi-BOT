const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const { getRandomInt } = require("./rand");

const loadYML = (name) => {
  return yaml.load(fs.readFileSync(`./config/${name}.yml`, "utf-8"));
};

exports.loadYML = loadYML;

exports.loadPlugins = () => {
  let plugins = {};
  const pluginsPath = fs.readdirSync(path.resolve(__dirname, "..", "plugins"));

  for (let plugin of pluginsPath) {
    plugins[plugin] = require("../plugins/" + plugin + "/index.js");
    bot.logger.info("插件 " + plugin + " 加载完成");
  }

  return plugins;
};

exports.processed = (qqData, plugins, type) => {
  let helloStr = `提瓦特第一可爱上线了，说 help 与我互动吧！`;
  let onlineStr = helloStr;

  // 如果好友增加了，向增加的好友问好
  if (type === "friend.increase") {
    bot.sendMessage(qqData.user_id, helloStr, "private");
    return;
  }

  // 如果群增加了，向增加的群问好
  if (type === "group.increase") {
    bot.sendMessage(qqData.group_id, helloStr, "group");
    return;
  }

  // 如果是命令，指派插件处理命令
  if (qqData.hasOwnProperty("message") && qqData.message[0].type === "text") {
    const command = getCommand(qqData.raw_message);

    if (command) {
      plugins[command]({ ...qqData, type });
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
      bot.gl.forEach((group) => {
        bot.sendMessage(group.group_id, onlineStr, "group");
      });
    }
    return;
  }
};

const getCommand = (msgData) => {
  const commandConfig = loadYML("command");

  for (let command in commandConfig) {
    if (commandConfig.hasOwnProperty(command)) {
      for (let setting of commandConfig[command]) {
        let reg = new RegExp(setting);
        if (reg.test(msgData)) {
          return command;
        }
      }
    }
  }

  return null;
};
