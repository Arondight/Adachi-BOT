import { createClient } from "oicq";
import init from "./src/utils/init.js";
import config from "./src/utils/config.js";
import { loadPlugins, processed } from "./src/utils/load.js";

config.read();
const BOT = createClient(account.qq, {
  log_level: "debug",
  platform: platform,
});
global.bot = BOT;

async function sendMessage(id, msg, type) {
  if ("group" === type) {
    await BOT.sendGroupMsg(id, msg);
  } else if ("private" === type) {
    await BOT.sendPrivateMsg(id, msg);
  }
}

async function sendMaster(id, msg, type) {
  if (Array.isArray(masters) && masters.length) {
    masters.forEach(async (master) => {
      if (master) {
        await BOT.sendPrivateMsg(master, msg);
      }
    });
  } else {
    await sendMessage(id, "未设置我的主人。", type);
  }
}

BOT.sendMessage = sendMessage;
BOT.sendMaster = sendMaster;

async function login() {
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
  bot.login(account.password);
}

async function run() {
  const plugins = await loadPlugins();

  bot.logger.debug(`群消息复读的概率为 ${repeatProb}% 。`);
  ++repeatProb;

  // 上线所有群发送一遍通知
  bot.on("system.online", async (msgData) => {
    await processed(msgData, plugins, "online");
  });

  // 监听群消息
  bot.on("message.group", async (msgData) => {
    let info = (await bot.getGroupInfo(msgData.group_id)).data;

    // 禁言时不发送消息
    // https://github.com/Arondight/Adachi-BOT/issues/28
    if (0 === info.shutup_time_me) {
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

async function main() {
  await login()
    .then(async () => await init())
    .then(async () => await run());
}

await main();
