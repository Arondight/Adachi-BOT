import figlet from "figlet";
import lodash from "lodash";
import { createClient } from "oicq";
import { init } from "./src/utils/init.js";
import { readConfig } from "./src/utils/config.js";
import { loadPlugins, processed } from "./src/utils/load.js";

global.bots = [];

function login() {
  for (const account of global.config.accounts) {
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
            if (global.config.atUser && sender && atSender) {
              msg = `[CQ:at,qq=${sender}]${delimiter}${msg}`;
            }

            // XXX 非管理员允许撤回两分钟以内的消息
            const permissionOK =
              global.config.deleteGroupMsgTime < 120
                ? true
                : "admin" === (await bot.getGroupMemberInfo(id, bot.uin)).data.role;
            const { message_id: mid } = (await bot.sendGroupMsg(id, msg)).data || {};

            if (true === tryDelete && undefined !== mid && global.config.deleteGroupMsgTime > 0 && permissionOK) {
              setTimeout(bot.deleteMsg.bind(bot), global.config.deleteGroupMsgTime * 1000, mid);
            }
            break;
          }
          case "private":
            bot.sendPrivateMsg(id, msg);
            break;
        }
      }
    };
    bot.sayMaster = async (id, msg, type = undefined, user = undefined) => {
      if (Array.isArray(global.config.masters) && global.config.masters.length) {
        global.config.masters.forEach((master) => master && bot.sendPrivateMsg(master, msg));
      } else {
        if (undefined !== id && "string" === typeof type && undefined !== user) {
          bot.say(id, "未设置我的主人。", type, user);
        }
      }
    };
    // 属性 sendMessage 和 sendMessage 为了兼容可能存在的旧插件
    bot.sendMessage = async (id, msg, type = "private", sender = undefined, delimiter = " ", atSender = true) => {
      await bot.say(id, msg, type, sender, true, delimiter, atSender);
    };
    bot.sendMaster = bot.sayMaster;

    global.bots.push(bot);

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

  global.bots.logger = global.bots[0] && global.bots[0].logger;
}

function hello() {
  const asciiArt = figlet.textSync(global.package.name, {
    font: "DOS Rebel",
    horizontalLayout: "full",
    verticalLayout: "full",
    width: 120,
    whitespaceBreak: true,
  });
  global.bots.logger.debug(`\n${asciiArt}\n\t\t\t项目主页：${global.package.homepage}`);
}

function report() {
  // 只打印一次日志
  const log = (text) => global.bots.logger.debug(`配置：${text}`);

  log(`登录账号 ${lodash.map(global.config.accounts, "qq").join(" 、 ")} 。`);
  log(`管理者已设置为 ${global.config.masters.join(" 、 ")} 。`);
  log(
    0 === global.config.prefixes.length || global.config.prefixes.includes(null)
      ? "所有的消息都将被视为命令。"
      : `命令前缀设置为 ${global.config.prefixes.join(" 、 ")} 。`
  );
  log(`${2 === global.config.atMe ? "只" : 0 === global.config.atMe ? "不" : ""}允许用户 @ 机器人。`);
  log(`群回复将${global.config.atUser ? "" : "不"}会 @ 用户。`);
  log(`群消息复读的概率为 ${(global.config.repeatProb / 100).toFixed(2)}% 。`);
  log(`上线${global.config.groupHello ? "" : "不"}发送群通知。`);
  log(`${global.config.groupGreetingNew ? "" : "不"}向新群友问好。`);
  log(`${global.config.friendGreetingNew ? "" : "不"}向新好友问好。`);
  log(`角色查询${global.config.characterTryGetDetail ? "尝试" : "不"}更新玩家信息。`);
  log(`耗时操作前${global.config.warnTimeCosts ? "" : "不"}发送提示。`);
  log(`用户每隔 ${global.config.requestInterval} 秒可以使用一次机器人。`);
  log(
    `${global.config.deleteGroupMsgTime ? global.config.deleteGroupMsgTime + " 秒后" : "不"}尝试撤回机器人发送的群消息`
  );
  log(`深渊记录将缓存 ${global.config.cacheAbyEffectTime} 小时。`);
  log(`玩家信息将缓存 ${global.config.cacheInfoEffectTime} 小时。`);
  log(`清理数据库 aby 中超过 ${global.config.dbAbyEffectTime} 小时的记录。`);
  log(`清理数据库 info 中超过 ${global.config.dbInfoEffectTime} 小时的记录。`);
  log(`${global.config.viewDebug ? "" : "不"}使用前端调试模式。`);
  log(`${global.config.saveImage ? "" : "不"}保存图片。`);
}

async function run() {
  const plugins = await loadPlugins();

  for (const bot of global.bots) {
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

(async function main() {
  readConfig();
  login();
  hello();
  report();
  await init();
  run();
})();
