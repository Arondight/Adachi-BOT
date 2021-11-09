/* global all, bots, command, config, master, rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import path from "path";
import lodash from "lodash";
import { checkAuth } from "./auth.js";
import { getRandomInt } from "./tools.js";

// 无需加锁
const timestamp = {};
const replyAuthName = "响应消息";

async function loadPlugins() {
  let plugins = {};
  const enableList = { ...command.enable, ...master.enable };
  const pluginLoadPath = path.resolve(rootdir, "src", "plugins");
  const pluginDirList =
    fs.readdirSync(pluginLoadPath).filter((f) => f && fs.statSync(path.resolve(pluginLoadPath, f)).isDirectory()) || [];

  for (const dir of pluginDirList) {
    const plugin = dir.toLowerCase();

    if (plugin in all.function) {
      if (enableList[plugin] && true === enableList[plugin]) {
        try {
          plugins[plugin] = await import(`../plugins/${dir}/index.js`);
          bots[0] && bots[0].logger.debug(`插件：加载 ${plugin} 成功。`);
        } catch (e) {
          bots[0] && bots[0].logger.error(`插件：加载 ${plugin} 失败（${e}）！`);
        }
      } else {
        bots[0] && bots[0].logger.warn(`插件：拒绝加载被禁用的插件 ${plugin} ！`);
      }
    } else {
      bots[0] && bots[0].logger.warn(`插件：拒绝加载未知插件 ${plugin} ！`);
    }
  }

  return plugins;
}

function isGroupBan(msg, bot) {
  const info = bot.getGroupInfo(msg.group_id).data;

  // getGroupInfo 未获取到有效数据则认为没有被禁言
  if (info && 0 !== info.shutup_time_me) {
    let time = new Date(0);
    time.setUTCSeconds(info.shutup_time_me);
    bot.logger.debug(
      `禁言：因已被组群 ${
        msg.group_name + "（ " + msg.group_id + " ）"
      }禁言拒绝发送消息，${time.toLocaleString()} 禁言结束。`
    );
    return true;
  }
  return false;
}

function processedFriendIncrease(msg, bot) {
  if (config.friendGreetingNew) {
    // 私聊不需要 @
    bot.say(msg.user_id, config.greetingNew, "private");
  }
}

function processedGroupIncrease(msg, bot) {
  if (!isGroupBan(msg, bot)) {
    if (bot.uin === msg.user_id) {
      // 如果加入了新群，尝试向全群问好
      // 群通知不需要 @
      bot.say(msg.group_id, config.greetingHello, "group");
    } else {
      // 如果有新群友，尝试向新群友问好
      if (config.groupGreetingNew && false !== checkAuth({ uid: msg.group_id }, replyAuthName, false)) {
        bot.say(msg.group_id, config.greetingNew, "group", msg.user_id);
      }
    }
  }
}

function processedPossibleCommand(msg, plugins, type, bot) {
  // 处理 @ 机器人
  const atMeReg = new RegExp(`^\\s*\\[CQ:at,qq=${bot.uin},text=.+?\\]\\s*`);
  const atMe = lodash
    .chain(msg.message)
    .filter({ type: "at" })
    .find({ data: { qq: bot.uin } })
    .value()
    ? true
    : false;

  if (atMe) {
    switch (config.atMe) {
      case 0:
        return false;
      case 1:
      // fall through
      case 2:
        if (!atMe) {
          return false;
        }
    }

    // [CQ:at,qq=123456789,text=@nickname]
    msg.raw_message = msg.raw_message.replace(atMeReg, "");
  }

  const regexPool = { ...command.regex, ...master.regex };
  const enableList = { ...command.enable, ...master.enable };
  let match = false;
  let thisPrefix = null;

  // 匹配命令前缀
  if (0 === config.prefixes.length || config.prefixes.includes(null)) {
    match = true;
  } else {
    for (const prefix of config.prefixes) {
      if (msg.raw_message.startsWith(prefix)) {
        match = true;
        thisPrefix = prefix;
        break;
      }
    }
  }

  if (!match) {
    return false;
  }

  msg.raw_message = msg.raw_message.slice(thisPrefix ? thisPrefix.length : 0).trimStart();

  // 匹配插件入口
  for (const regex in regexPool) {
    const r = new RegExp(regex, "i");
    const plugin = regexPool[regex];

    if (enableList[plugin] && r.test(msg.raw_message)) {
      // 只允许管理者执行主人命令
      if (master.enable[plugin] && !config.masters.includes(msg.user_id)) {
        const id = "group" === type ? msg.group_id : msg.user_id;
        bot.say(id, "不能使用管理命令。", type, msg.user_id);
        return true;
      }

      if ("group" === type && isGroupBan(msg, bot)) {
        return true;
      }

      // 同步 oicq 数据结构
      if (lodash.hasIn(msg.message, [0, "data", "text"])) {
        msg.message = lodash.chain(msg.message).filter({ type: "text" }).slice(0, 1).value();
        msg.message[0].data.text = msg.raw_message;
      }

      // 添加自定义属性
      msg.text = msg.raw_message;
      msg.type = type;
      msg.uid = msg.user_id;
      msg.gid = msg.group_id;
      msg.sid = "group" === msg.type ? msg.gid : msg.uid;
      msg.name = msg.sender.nickname;
      msg.atMe = atMe;
      msg.bot = bot;

      if (false !== checkAuth(msg, replyAuthName, false)) {
        if (config.requestInterval < msg.time - (timestamp[msg.user_id] || (timestamp[msg.user_id] = 0))) {
          timestamp[msg.user_id] = msg.time;
          // 参数 bot 为了兼容可能存在的旧插件
          plugins[plugin].run(msg, bot);
          return true;
        }
      }
    }
  }
}

function processedGroup(msg, bot) {
  if (config.repeatProb > 0 && getRandomInt(100 * 100) < config.repeatProb + 1 && !isGroupBan(msg, bot)) {
    // 复读群消息不需要 @
    bot.say(msg.group_id, msg.raw_message, "group");
  }
}

function processedOnline(bot) {
  if (config.groupHello) {
    bot.gl.forEach((group) => {
      const greeting =
        false !== checkAuth({ uid: group.group_id }, replyAuthName, false) ? config.greetingOnline : config.greetingDie;

      if (!isGroupBan(group, bot) && "string" === typeof greeting) {
        // 群通知不需要 @
        bot.say(group.group_id, greeting, "group");
      }
    });
  }
}

function processed(msg, plugins, type, bot) {
  // 如果好友增加了，尝试向新朋友问好
  if (type === "friend.increase") {
    processedFriendIncrease(msg, bot);
    return;
  }

  // 如果有新成员加入了组群，尝试向新成员或者全群问好
  if (type === "group.increase") {
    processedGroupIncrease(msg, bot);
    return;
  }

  // 如果收到的信息是命令，尝试指派插件处理命令
  if (lodash.find(msg.message, { type: "text" })) {
    if (processedPossibleCommand(msg, plugins, type, bot)) {
      return;
    }
  }

  // 如果不是命令，且为群消息，随机复读群消息
  if ("group" === type) {
    processedGroup(msg, bot);
    return;
  }

  // 如果机器人上线，尝试所有群发送一遍上线通知
  if ("online" === type) {
    processedOnline(bot);
    return;
  }
}

export { loadPlugins, processed };
