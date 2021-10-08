import { createClient } from "oicq";
import init from "./src/utils/init.js";
import { readConfig } from "./src/utils/config.js";
import { loadPlugins, processed } from "./src/utils/load.js";

async function login() {
  global.bots = [];

  for (const account of config.accounts) {
    const BOT = createClient(account.qq, {
      platform: account.platform,
      log_level: "debug",
    });

    BOT.sendMessage = async (
      id,
      msg,
      type = "private",
      sender = undefined,
      delimiter = " ",
      atSender = true
    ) => {
      switch (true) {
        case "group" === type:
          if (config.atUser && sender && atSender) {
            msg = `[CQ:at,qq=${sender}]${delimiter}${msg}`;
          }
          await BOT.sendGroupMsg(id, msg);
          break;
        case "private" === type:
          await BOT.sendPrivateMsg(id, msg);
          break;
      }
    };

    BOT.sendMaster = async (id, msg, type, user) => {
      if (Array.isArray(config.masters) && config.masters.length) {
        config.masters.forEach(async (master) => {
          if (master) {
            await BOT.sendPrivateMsg(master, msg);
          }
        });
      } else {
        await BOT.sendMessage(id, "未设置我的主人。", type, user);
      }
    };

    bots.push(BOT);

    // 处理登录滑动验证码
    BOT.on("system.login.slider", () => {
      process.stdin.once("data", (input) => BOT.sliderLogin(input.toString()));
    });

    // 处理登录图片验证码
    BOT.on("system.login.captcha", () => {
      process.stdin.once("data", (input) => BOT.captchaLogin(input.toString()));
    });

    // 处理设备锁事件
    BOT.on("system.login.device", () => {
      BOT.logger.info("在浏览器中打开网址，手机扫码完成后按下回车键继续。");
      process.stdin.once("data", () => BOT.login());
    });

    // 登录
    BOT.login(account.password);
  }
}

async function report() {
  // 只打印一次日志
  const say = (text) => bots[0] && bots[0].logger.debug(`配置：${text}`);

  say(`管理者已设置为 ${config.masters.join(" 、 ")} 。`);
  say(`群回复将${config.atUser ? "" : "不"}会 @ 用户。`);
  say(`群消息复读的概率为 ${config.repeatProb}% 。`);
  say(`上线${config.groupHello ? "" : "不"}发送群通知。`);
  say(`${config.groupGreetingNew ? "" : "不"}向新群友问好。`);
  say(`${config.friendGreetingNew ? "" : "不"}向新好友问好。`);
  say(`深渊记录将缓存 ${config.cacheAbyEffectTime} 小时。`);
  say(`玩家信息将缓存 ${config.cacheInfoEffectTime} 小时。`);
  say(`清理数据库 aby 中超过 ${config.dbAbyEffectTime} 小时的记录。`);
  say(`清理数据库 info 中超过 ${config.dbInfoEffectTime} 小时的记录。`);
}

async function run() {
  const plugins = await loadPlugins();

  ++config.repeatProb;

  for (const bot of bots) {
    // 上线所有群发送一遍通知
    bot.on("system.online", async (msgData) => {
      await processed(msgData, plugins, "online", bot);
    });

    // 监听群消息
    bot.on("message.group", async (msgData) => {
      let info = (await bot.getGroupInfo(msgData.group_id)).data;

      // 禁言时不发送消息
      // https://github.com/Arondight/Adachi-BOT/issues/28
      if (0 === info.shutup_time_me) {
        await processed(msgData, plugins, "group", bot);
      }
    });

    // 监听好友消息
    bot.on("message.private", async (msgData) => {
      await processed(msgData, plugins, "private", bot);
    });

    // 监听加好友事件
    bot.on("notice.friend.increase", async (msgData) => {
      await processed(msgData, plugins, "friend.increase", bot);
    });

    // 监听入群事件
    bot.on("notice.group.increase", async (msgData) => {
      await processed(msgData, plugins, "group.increase", bot);
    });
  }
}

async function main() {
  await readConfig()
    .then(async () => await login())
    .then(async () => await init())
    .then(async () => await report())
    .then(async () => await run());
}

await main();
