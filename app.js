import init from "./src/utils/init.js";
import { loadPlugins, loadYML, processed } from "./src/utils/load.js";
import { createClient } from "oicq";

const Setting = loadYML("setting");
const Greeting = loadYML("greeting");

// 1:安卓手机 2:aPad 3:安卓手表 4:MacOS 5:iPad
let platform = 1;

if ([1, 2, 3, 4, 5].includes(Setting["account"].platform)) {
  platform = Setting["account"].platform;
}

let MASTER = Setting["master"];
let REPEATPROB = parseInt(Setting["repeatProb"]);
let GROUPHELLO = parseInt(Setting["groupHello"]);
let GROUPGREETINGNEW = parseInt(Setting["groupGreetingNew"]);
let FRIENDGREETINGNEW = parseInt(Setting["friendGreetingNew"]);
let GREETING_ONLINE = Greeting["online"];
let GREETING_DIE = Greeting["die"];
let GREETING_HELLO = Greeting["hello"];
let GREETING_NEW = Greeting["new"];
let BOT = createClient(Setting["account"].qq, {
  log_level: "debug",
  platform: platform,
});

BOT.sendMessage = async (id, msg, type) => {
  if (type === "group") {
    await BOT.sendGroupMsg(id, msg);
  } else if (type === "private") {
    await BOT.sendPrivateMsg(id, msg);
  }
};

BOT.sendMaster = async (id, msg, type) => {
  if (typeof Setting["master"] === "number") {
    await BOT.sendPrivateMsg(Setting["master"], msg);
  } else {
    await BOT.sendMessage(id, "未设置我的主人。", type);
  }
};

global.bot = BOT;
global.master = MASTER;
// 未配置则不复读群消息
global.repeatProb = REPEATPROB ? REPEATPROB : 0;
// 未配置则不发送群通知
global.groupHello = GROUPHELLO ? GROUPHELLO : 0;
// 未配置则向新群员问好
global.groupGreetingNew = GROUPGREETINGNEW ? GROUPGREETINGNEW : 1;
// 未配置则向新好友问好
global.friendGreetingNew = FRIENDGREETINGNEW ? FRIENDGREETINGNEW : 1;
global.greetingOnline = GREETING_ONLINE;
global.greetingDie = GREETING_DIE;
global.greetingHello = GREETING_HELLO;
global.greetingNew = GREETING_NEW;

async function login () {
  // 处理登录滑动验证码
  bot.on("system.login.slider", () => {
    process.stdin.once("data", (input) => {
      bot.sliderLogin(input.toString());
    });
  });

  // 处理登录图片验证码
  bot.on("system.login.captcha", () => {
    process.stdin.once("data", (input) => {
      bot.captchaLogin(input.toString());
    });
  });

  // 处理设备锁事件
  bot.on("system.login.device", () => {
    bot.logger.info("手机扫码完成后按下 Enter 继续……");
    process.stdin.once("data", () => {
      bot.login();
    });
  });
  bot.login(Setting["account"].password);
};

async function main() {
  await login();
  await init();

  const plugins = await loadPlugins();
  bot.logger.info("群消息复读的概率为 " + repeatProb + "%");
  ++repeatProb;

  // 上线所有群发送一遍通知
  bot.on("system.online", async (msgData) => {
    await processed(msgData, plugins, "online");
  });

  // 监听群消息
  bot.on("message.group", async (msgData) => {
    // 禁言时不发送消息
    // https://github.com/Arondight/Adachi-BOT/issues/28
    let info = (await bot.getGroupInfo(msgData.group_id)).data;

    if (info.shutup_time_me === 0) {
      await processed(msgData, plugins, "group");
    }
  });

  // 监听好友消息
  bot.on("message.private", async (msgData) => {
    await processed(msgData, plugins, "private");
  });

  // 监听加好友事件
  bot.on("notice.friend.increase", async (msgData) => {
    await processed(msgData, plugins, "friend.increase");
  });

  // 监听入群事件
  bot.on("notice.group.increase", async (msgData) => {
    await processed(msgData, plugins, "group.increase");
  });
}

await main();
