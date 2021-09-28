import { loadYML } from "./yaml.js";

const Setting = loadYML("setting");
const Greeting = loadYML("greeting");

async function readConfig() {
  // 此为配置文件中没有对应字段或者用户配置了无效的值时，对应字段的默认值
  const defaultConfig = {
    // 登录协议为 iPad
    platform: 5,
    // 不复读群消息
    repeatProb: 0,
    // 不发送群通知
    groupHello: 0,
    // 不向新群员问好
    groupGreetingNew: 0,
    // 不向新好友问好
    friendGreetingNew: 0,
    // 深渊记录缓存一小时
    cacheAbyEffectTime: 1,
    // 玩家数据缓存一小时
    cacheInfoEffectTime: 1,
    // 数据库 aby 的数据有效性为一小时
    dbAbyEffectTime: 1,
    // 数据库 info 的数据有效性为一星期
    dbInfoEffectTime: 168,
  };

  // 1:安卓手机 2:aPad 3:安卓手表 4:MacOS 5:iPad
  let platform = [1, 2, 3, 4, 5].includes(Setting["account"].platform)
    ? Setting["account"].platform
    : undefined;
  let account = Setting["account"];
  // 用于兼容旧配置，已经被 masters 取代
  let master = Setting["master"];
  let masters = Setting["masters"];
  let repeatProb = parseInt(Setting["repeatProb"]);
  let groupHello = parseInt(Setting["groupHello"]);
  let groupGreetingNew = parseInt(Setting["groupGreetingNew"]);
  let friendGreetingNew = parseInt(Setting["friendGreetingNew"]);
  let cacheAbyEffectTime = parseInt(Setting["cacheAbyEffectTime"]);
  let cacheInfoEffectTime = parseInt(Setting["cacheInfoEffectTime"]);
  let dbAbyEffectTime = parseInt(Setting["dbAbyEffectTime"]);
  let dbInfoEffectTime = parseInt(Setting["dbInfoEffectTime"]);
  let greetingOnline = Greeting["online"];
  let greetingDie = Greeting["die"];
  let greetingHello = Greeting["hello"];
  let greetingNew = Greeting["new"];

  global.config = {};

  const getConfig = (...pairs) => {
    pairs &&
      pairs.forEach((pair) => {
        let prop = Object.keys(pair)[0];
        let val = pair[prop];

        if (undefined === defaultConfig[prop]) {
          config[prop] = val;
        }
        config[prop] = val ? val : defaultConfig[prop];
      });
  };

  getConfig(
    { platform },
    { account },
    { masters: (masters ? masters : []).concat(master ? [master] : []) },
    { repeatProb },
    { groupHello },
    { groupGreetingNew },
    { friendGreetingNew },
    { cacheAbyEffectTime },
    { cacheInfoEffectTime },
    { dbAbyEffectTime },
    { dbInfoEffectTime },
    { greetingOnline },
    { greetingDie },
    { greetingHello },
    { greetingNew }
  );
}

export { readConfig };
