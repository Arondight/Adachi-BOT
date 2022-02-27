import fs from "fs";
import lodash from "lodash";
import path from "path";
import { checkAuth } from "#utils/auth";
import { isGroupBan, toCqcode } from "#utils/oicq";
import { getRandomInt } from "#utils/tools";

// 无需加锁
const timestamp = {};

async function loadPlugins() {
  let plugins = {};
  const enableList = { ...global.command.enable, ...global.master.enable };
  const pluginLoadPath = path.resolve(global.rootdir, "src", "plugins");
  const pluginDirList =
    fs.readdirSync(pluginLoadPath).filter((f) => f && fs.statSync(path.resolve(pluginLoadPath, f)).isDirectory()) || [];

  for (const dir of pluginDirList) {
    const plugin = dir.toLowerCase();

    if (plugin in global.all.function) {
      if (enableList[plugin] && true === enableList[plugin]) {
        try {
          plugins[plugin] = await import(`../plugins/${dir}/index.js`);
          global.bots.logger.debug(`插件：加载 ${plugin} 成功。`);
        } catch (e) {
          global.bots.logger.error(`错误：加载 ${plugin} 插件失败，因为“${e}”。`);
        }
      } else {
        global.bots.logger.warn(`插件：拒绝加载被禁用的插件 ${plugin} ！`);
      }
    } else {
      global.bots.logger.warn(`插件：拒绝加载未知插件 ${plugin} ！`);
    }
  }

  return plugins;
}

function doPossibleCommand(msg, plugins, type, bot) {
  if (undefined === type) {
    return false;
  }

  // 处理 @ 机器人
  // [CQ:at,type=at,qq=123456789,text=@昵称]
  const atMeReg = new RegExp(`^\\s*\\[CQ:at,type=.*?,qq=${bot.uin},text=.+?\\]\\s*`);
  const atMe = lodash.chain(msg.message).filter({ type: "at" }).find({ qq: bot.uin }).value() ? true : false;

  if (atMe) {
    switch (global.config.atMe) {
      case 0:
        return false;
      case 1:
      // fall through
      case 2:
        if (!atMe) {
          return false;
        }
    }

    msg.raw_message = msg.raw_message.replace(atMeReg, "");
  }

  const regexPool = { ...global.command.regex, ...global.master.regex };
  const enableList = { ...global.command.enable, ...global.master.enable };
  let match = false;
  let thisPrefix = null;

  // 匹配命令前缀
  if (0 === global.config.prefixes.length || global.config.prefixes.includes(null)) {
    match = true;
  } else {
    for (const prefix of global.config.prefixes) {
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
      if (global.master.enable[plugin] && !global.config.masters.includes(msg.user_id)) {
        const id = "group" === type ? msg.group_id : msg.user_id;
        bot.say(id, "不能使用管理命令。", type, msg.user_id);
        return true;
      }

      if ("group" === type && true === isGroupBan(msg, type, bot)) {
        return true;
      }

      // 同步 oicq 数据结构
      if (lodash.hasIn(msg.message, "[0].text")) {
        msg.message = lodash.chain(msg.message).filter({ type: "text" }).slice(0, 1).value();
        msg.message[0].text = msg.raw_message;
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

      if (false !== checkAuth(msg, global.innerAuthName.reply, false)) {
        if (global.config.requestInterval < msg.time - (timestamp[msg.user_id] || (timestamp[msg.user_id] = 0))) {
          timestamp[msg.user_id] = msg.time;
          // 参数 bot 为了兼容可能存在的旧插件
          plugins[plugin].run(msg, bot);
          return true;
        }
      }
    }
  }
}

function doNoticeFriendIncrease(msg, bot) {
  if (global.config.friendGreetingNew) {
    // 私聊不需要 @
    bot.say(msg.user_id, global.greeting.new, "private");
  }
}

function doNoticeGroupIncrease(msg, bot) {
  if (bot.uin === msg.user_id) {
    // 如果加入了新群，尝试向全群问好
    // 群通知不需要 @
    bot.say(msg.group_id, global.greeting.hello, "group");
  } else {
    // 如果有新群友，尝试向新群友问好
    if (
      global.config.groupGreetingNew &&
      false !== checkAuth({ uid: msg.group_id }, global.innerAuthName.reply, false)
    ) {
      bot.say(msg.group_id, global.greeting.new, "group", msg.user_id);
    }
  }
}

function doMessageGroup(msg, bot) {
  if (global.config.repeatProb > 0 && getRandomInt(100 * 100) < global.config.repeatProb + 1) {
    // 复读群消息不需要 @
    bot.say(msg.group_id, msg.raw_message, "group");
  }
}

function doSystemOnline(bot) {
  // 通知管理者
  bot.sayMaster(undefined, "我上线了。");

  // 尝试通知群
  if (global.config.groupHello) {
    bot.gl.forEach((group) => {
      const greeting =
        false !== checkAuth({ sid: group.group_id }, global.innerAuthName.reply, false)
          ? global.greeting.online
          : global.greeting.die;

      if ("string" === typeof greeting) {
        // 群通知不需要 @
        bot.say(group.group_id, greeting, "group");
      }
    });
  }
}

function processed(msg, plugins, event, bot) {
  const types = { "message.private": "private", "message.group": "group" };

  if (undefined !== msg.raw_message && Array.isArray(msg.message)) {
    msg.raw_message = toCqcode(msg);
  }

  // 如果信息是命令，尝试指派插件处理命令
  if (Object.keys(types).includes(event) && lodash.find(msg.message, { type: "text" })) {
    if (doPossibleCommand(msg, plugins, types[event], bot)) {
      return;
    }
  }

  // 如果信息不是命令
  switch (event) {
    // 好友增加，尝试向新朋友问好
    case "notice.friend.increase":
      doNoticeFriendIncrease(msg, bot);
      break;
    // 新成员入群，尝试向新成员或者全群问好
    case "notice.group.increase":
      doNoticeGroupIncrease(msg, bot);
      break;
    // 随机复读群消息
    case "message.group":
      doMessageGroup(msg, bot);
      break;
    // 发送上线通知
    case "system.online":
      doSystemOnline(bot);
      break;
  }
}

export { loadPlugins, processed };
