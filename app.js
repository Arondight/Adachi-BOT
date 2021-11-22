/* global bots, config */
/* eslint no-undef: "error" */

import lodash from "lodash";
import { createClient } from "oicq";
import { init } from "./src/utils/init.js";
import { readConfig } from "./src/utils/config.js";
import { loadPlugins, processed } from "./src/utils/load.js";

global.bots = [];

function login() {
  for (const account of config.accounts) {
    const bot = createClient(account.qq, {
      platform: account.platform,
      log_level: "debug",
    });

    bot.say = async (
      id,
      msg,
      type = "private",
      sender = undefined,
      tryDelete = false,
      delimiter = " ",
      atSender = true
    ) => {
      if (msg && "" !== msg) {
        switch (type) {
          case "group": {
            if (config.atUser && sender && atSender) {
              msg = `[CQ:at,qq=${sender}]${delimiter}${msg}`;
            }

            // XXX 非管理员允许撤回两分钟以内的消息
            const permissionOK =
              config.deleteGroupMsgTime < 120
                ? true
                : "admin" === (await bot.getGroupMemberInfo(id, bot.uin)).data.role;
            const { message_id: mid } = (await bot.sendGroupMsg(id, msg)).data || {};

            if (true === tryDelete && undefined !== mid && config.deleteGroupMsgTime > 0 && permissionOK) {
              setTimeout(bot.deleteMsg.bind(bot), config.deleteGroupMsgTime * 1000, mid);
            }
            break;
          }
          case "private":
            bot.sendPrivateMsg(id, msg);
            break;
        }
      }
    };
    bot.sayMaster = async (id, msg, type, user) => {
      if (Array.isArray(config.masters) && config.masters.length) {
        config.masters.forEach((master) => master && bot.sendPrivateMsg(master, msg));
      } else {
        bot.say(id, "未设置我的主人。", type, user);
      }
    };
    // 属性 sendMessage 和 sendMessage 为了兼容可能存在的旧插件
    bot.sendMessage = async (id, msg, type = "private", sender = undefined, delimiter = " ", atSender = true) => {
      await bot.say(id, msg, type, sender, true, delimiter, atSender);
    };
    bot.sendMaster = bot.sayMaster;

    bots.push(bot);

    // 处理登录滑动验证码
    bot.on("system.login.slider", () => {
      process.stdin.once("data", (input) => bot.sliderLogin(input.toString()));
    });

    // 处理登录图片验证码
    bot.on("system.login.captcha", () => {
      process.stdin.once("data", (input) => bot.captchaLogin(input.toString()));
    });

    // 处理设备锁事件
    bot.on("system.login.device", () => {
      bot.logger.info("在浏览器中打开网址，手机扫码完成后按下回车键继续。");
      process.stdin.once("data", () => bot.login());
    });

    // 登录
    bot.login(account.password);
  }
}

function report() {
  // 只打印一次日志
  const log = (text) => bots[0] && bots[0].logger.debug(`配置：${text}`);

  log(`登录账号 ${lodash.map(config.accounts, "qq").join(" 、 ")} 。`);
  log(`管理者已设置为 ${config.masters.join(" 、 ")} 。`);
  log(
    0 === config.prefixes.length || config.prefixes.includes(null)
      ? "所有的消息都将被视为命令。"
      : `命令前缀设置为 ${config.prefixes.join(" 、 ")} 。`
  );
  log(`${2 === config.atMe ? "只" : 0 === config.atMe ? "不" : ""}允许用户 @ 机器人。`);
  log(`群回复将${config.atUser ? "" : "不"}会 @ 用户。`);
  log(`群消息复读的概率为 ${(config.repeatProb / 100).toFixed(2)}% 。`);
  log(`上线${config.groupHello ? "" : "不"}发送群通知。`);
  log(`${config.groupGreetingNew ? "" : "不"}向新群友问好。`);
  log(`${config.friendGreetingNew ? "" : "不"}向新好友问好。`);
  log(`角色查询${config.characterTryGetDetail ? "尝试" : "不"}更新玩家信息。`);
  log(`耗时操作前${config.warnTimeCosts ? "" : "不"}发送提示。`);
  log(`用户每隔 ${config.requestInterval} 秒可以使用一次机器人。`);
  log(`${config.deleteGroupMsgTime ? config.deleteGroupMsgTime + " 秒后" : "不"}尝试撤回机器人发送的群消息`);
  log(`深渊记录将缓存 ${config.cacheAbyEffectTime} 小时。`);
  log(`玩家信息将缓存 ${config.cacheInfoEffectTime} 小时。`);
  log(`清理数据库 aby 中超过 ${config.dbAbyEffectTime} 小时的记录。`);
  log(`清理数据库 info 中超过 ${config.dbInfoEffectTime} 小时的记录。`);
  log(`${config.viewDebug ? "" : "不"}使用前端调试模式。`);
}

async function run() {
  const plugins = await loadPlugins();

  for (const bot of bots) {
    // 监听上线事件
    bot.on("system.online", (msg) => processed(msg, plugins, "online", bot));
    // 监听群消息事件
    bot.on("message.group", (msg) => processed(msg, plugins, "group", bot));
    // 监听好友消息事件
    bot.on("message.private", (msg) => processed(msg, plugins, "private", bot));
    // 监听加好友事件
    bot.on("notice.friend.increase", (msg) => processed(msg, plugins, "friend.increase", bot));
    // 监听入群事件
    bot.on("notice.group.increase", (msg) => processed(msg, plugins, "group.increase", bot));
  }
}

async function main() {
  readConfig();
  login();
  report();
  await init();
  await run();
}

main();
