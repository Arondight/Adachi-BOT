/* global all, bots, command, config, master, rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import path from "path";
import lodash from "lodash";
import { hasAuth } from "./auth.js";
import { getRandomInt } from "./tools.js";

async function loadPlugins() {
  let plugins = {};
  const enableList = { ...command.enable, ...master.enable };
  const pluginLoadPath = path.resolve(rootdir, "src", "plugins");
  const pluginDirList =
    fs
      .readdirSync(pluginLoadPath)
      .filter(
        (f) => f && fs.statSync(path.resolve(pluginLoadPath, f)).isDirectory()
      ) || [];

  for (const dir of pluginDirList) {
    const plugin = dir.toLowerCase();

    if (plugin in all.function) {
      if (enableList[plugin] && true === enableList[plugin]) {
        try {
          plugins[plugin] = await import(`../plugins/${dir}/index.js`);
          bots[0] && bots[0].logger.debug(`插件：加载 ${plugin} 成功。`);
        } catch (e) {
          bots[0] &&
            bots[0].logger.error(`插件：加载 ${plugin} 失败（${e}）！`);
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
  //
  // 如果好友增加了，尝试向新朋友问好
  //
  if (type === "friend.increase") {
    if (config.friendGreetingNew) {
      // 私聊不需要 @
      bot.sendMessage(qqData.user_id, config.greetingNew, "private");
    }

    return;
  }

  //
  // 如果有新成员加入了组群，尝试向新成员或者全群问好
  //
  if (type === "group.increase") {
    if (bot.uin === qqData.user_id) {
      // 如果加入了新群，尝试向全群问好
      // 群通知不需要 @
      bot.sendMessage(qqData.group_id, config.greetingHello, "group");
    } else {
      // 如果有新群友，尝试向新群友问好
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

  //
  // 如果收到的信息是命令，尝试指派插件处理命令
  // 增加了变量 qqData.atMe: boolean
  //
  if (lodash.find(qqData.message, { type: "text" })) {
    // 处理 @ 机器人
    const atMeReg = new RegExp(`^\\s*\\[CQ:at,qq=${bot.uin},text=.+?\\]\\s*`);
    qqData.atMe = lodash
      .chain(qqData.message)
      .filter({ type: "at" })
      .find({ data: { qq: bot.uin } })
      .value()
      ? true
      : false;

    if (qqData.atMe) {
      switch (true) {
        case 0 === config.atMe:
          return;
        case 1 === config.atMe:
        // fall through
        case 2 === config.atMe:
          if (!qqData.atMe) {
            return;
          }
      }

      // [CQ:at,qq=123456789,text=@nickname]
      qqData.raw_message = qqData.raw_message.replace(atMeReg, "");
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
        if (qqData.raw_message.startsWith(prefix)) {
          match = true;
          thisPrefix = prefix;
          break;
        }
      }
    }

    if (!match) {
      return;
    }

    qqData.raw_message = qqData.raw_message
      .slice(thisPrefix ? thisPrefix.length : 0)
      .trimStart();

    // 匹配插件入口
    for (const regex in regexPool) {
      const r = new RegExp(regex, "i");
      const plugin = regexPool[regex];

      if (enableList[plugin] && r.test(qqData.raw_message)) {
        // 只允许管理者执行主人命令
        if (master.enable[plugin] && !config.masters.includes(qqData.user_id)) {
          const id = "group" === type ? qqData.group_id : qqData.user_id;
          await bot.sendMessage(id, "不能使用管理命令。", type, qqData.user_id);
          return;
        }

        if (
          (await hasAuth(qqData.group_id, "reply")) &&
          (await hasAuth(qqData.user_id, "reply"))
        ) {
          // 同步 oicq 数据结构
          if (lodash.hasIn(qqData.message, [0, "data", "text"])) {
            qqData.message = lodash
              .chain(qqData.message)
              .filter({ type: "text" })
              .slice(0, 1)
              .value();
            qqData.message[0].data.text = qqData.raw_message;
          }

          plugins[plugin].run({ ...qqData, type }, bot);
          return;
        }
      }
    }
  }

  //
  // 如果不是命令，且为群消息，随机复读群消息
  //
  if ("group" === type) {
    if (config.repeatProb > 0 && getRandomInt(100) < config.repeatProb) {
      // 复读群消息不需要 @
      bot.sendMessage(qqData.group_id, qqData.raw_message, "group");
    }

    return;
  }

  //
  // 如果机器人上线，尝试所有群发送一遍上线通知
  //
  if ("online" === type) {
    if (config.groupHello) {
      bot.gl.forEach(async (group) => {
        const info = (await bot.getGroupInfo(group.group_id)).data;
        const greeting = (await hasAuth(group.group_id, "reply"))
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
