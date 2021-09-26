import { loadYML } from "./yaml.js";

const Setting = loadYML("setting");
const Greeting = loadYML("greeting");

function read() {
  // 1:安卓手机 2:aPad 3:安卓手表 4:MacOS 5:iPad
  let PLATFORM = 5;
  if ([1, 2, 3, 4, 5].includes(Setting["account"].platform)) {
    PLATFORM = Setting["account"].platform;
  }

  let ACCOUNT = Setting["account"];
  let MASTER = Setting["master"]; // 用于兼容旧配置
  let MASTERS = Setting["masters"];
  let REPEATPROB = parseInt(Setting["repeatProb"]);
  let GROUPHELLO = parseInt(Setting["groupHello"]);
  let GROUPGREETINGNEW = parseInt(Setting["groupGreetingNew"]);
  let FRIENDGREETINGNEW = parseInt(Setting["friendGreetingNew"]);
  let GREETING_ONLINE = Greeting["online"];
  let GREETING_DIE = Greeting["die"];
  let GREETING_HELLO = Greeting["hello"];
  let GREETING_NEW = Greeting["new"];

  global.platform = PLATFORM;
  global.account = ACCOUNT;
  global.master = MASTER ? [MASTER] : [];
  global.masters = (MASTERS ? MASTERS : []).concat(MASTER);
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
}

export default { read };
