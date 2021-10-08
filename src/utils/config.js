import lodash from "lodash";
import { loadYML } from "./yaml.js";

const Setting = loadYML("setting");
const Greeting = loadYML("greeting");
const Command = loadYML("command");
const Master = loadYML("command_master");
const Alias = loadYML("alias");
const Menu = loadYML("menu");

function map(object, key, defaultValue = undefined, revert = false) {
  return lodash.reduce(
    object,
    (pair, v, k) => {
      if (true === revert) {
        v[key] && (pair[v[key]] = k);
      } else {
        pair[k] = v[key] || defaultValue;
      }
      return pair;
    },
    {}
  );
}

function mapArray(object, key, defaultValue = undefined, revert = false) {
  return lodash.reduce(
    object,
    (pair, v, k) => {
      (v[key] || []).forEach((c) => {
        if (true === revert) {
          c && (pair[c] = k);
        } else {
          (pair[k] || (pair[k] = [])).push(c || defaultValue);
        }
      });
      return pair;
    },
    {}
  );
}

function mapObject(object, key, defaultValue = undefined, revert = false) {
  return lodash.reduce(
    object,
    (pair, v, k) => {
      Object.keys(v[key] || {}).forEach((c) => {
        if (true === revert) {
          c && (pair[c] = k);
        } else {
          (pair[k] || (pair[k] = [])).push(c || defaultValue);
        }
      });
      return pair;
    },
    {}
  );
}

// global[key].enable                -> plugin:    is_enabled (boolean)
// global[key].weights               -> plugin:    weights (number)
// global[key].regex                 -> regex:     plugin (string)
// global[key].function              -> function:  plugin (string)
// global[key].functions.weights     -> function:  weights (number)
// global[key].functions.name        -> function:  name (string)
// global[key].functions.usage       -> function:  usage (string)
// global[key].functions.description -> function:  description (string)
// global[key].functions.entrance    -> function:  entrance (string)
function getCommand(obj, key) {
  global[key] = {};
  global[key].functions = {};

  global[key].enable = map(obj, "enable", false);
  global[key].weights = map(obj, "weights", 0);
  global[key].regex = mapArray(obj, "regex", undefined, true);
  global[key].function = mapObject(obj, "functions", undefined);

  for (const name in obj) {
    const add = (obj, key, name, prop, callback) => {
      global[key].functions[prop] = lodash.assign(
        global[key].functions[prop] || {},
        callback(obj[name].functions, prop, 0)
      );
    };

    add(obj, key, name, "weights", map, 0);
    add(obj, key, name, "name", map);
    add(obj, key, name, "usage", map);
    add(obj, key, name, "description", map);
    add(obj, key, name, "entrance", mapArray, undefined, true);
  }
}

// object: command or master
function makeUsage(object) {
  if (!(object === command || object === master)) {
    return "";
  }

  const listMark = "🔘";
  const commentMark = "👉";
  const pluginList = new Map(
    Object.entries(object.weights).sort((a, b) => b[1] - a[1])
  );
  let text = "";

  for (const plugin of pluginList.keys()) {
    let functionWeights = {};

    if (!object.enable[plugin]) {
      continue;
    }

    for (const k in object.functions.weights) {
      if (object.function[plugin].includes(k)) {
        functionWeights[k] = object.functions.weights[k];
      }
    }

    const functionList = new Map(
      Object.entries(functionWeights).sort((a, b) => b[1] - a[1])
    );

    for (const func of functionList.keys()) {
      text += `${listMark} ${object.functions.name[func] || "?"} ${
        object.functions.usage[func] || ""
      } ${object.functions.description[func] ? commentMark : ""} ${
        object.functions.description[func] || ""
      }\n`;
    }
  }

  text += text
    ? "-------------------\n<> 表示必填，[] 表示可选，前面需加空格"
    : "我什么都不会哦。";

  object.usage = text;
}

// global.config
function readSettingGreetingMenu() {
  // 此为配置文件中没有对应字段或者用户配置了无效的值时，对应字段的默认值
  const defaultConfig = {
    // 登录协议为 iPad
    platform: 5,
    // 群聊回复时不 @ 用户
    atUser: 0,
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

  let account = Setting["account"];
  let accounts = Setting["accounts"];
  // 用于兼容旧配置，已经被 masters 取代
  let master = Setting["master"];
  let masters = Setting["masters"];
  let atUser = parseInt(Setting["atUser"]);
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
  let menu = Menu;

  global.config = {};

  const getConfig = (...pairs) => {
    pairs &&
      pairs.forEach((pair) => {
        let prop = Object.keys(pair)[0];
        let val = pair[prop];

        if (undefined === defaultConfig[prop]) {
          config[prop] = val;
        }
        config[prop] = val || defaultConfig[prop];
      });
  };

  getConfig(
    { accounts: [...(accounts || []), ...(account ? [account] : [])] },
    { masters: [...(masters || []), ...(master ? [master] : [])] },
    { atUser },
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
    { greetingNew },
    { menu }
  );

  for (const option of config.accounts) {
    // 1:安卓手机、 2:aPad、 3:安卓手表、 4:MacOS、 5:iPad
    if (![1, 2, 3, 4, 5].includes(option.platform)) {
      option.platform = defaultConfig.platform;
    }
  }
}

// global.alias ->  alias: name (string)
function readAlias() {
  global.alias = lodash.reduce(
    Alias,
    (pair, v, k) => {
      v.forEach((c) => (pair[c] = k));
      return pair;
    },
    {}
  );
}

// global.command
// global.master
function readCommand() {
  getCommand(Command, "command");
  getCommand(Master, "master");
}

// 目前就这两个的值是数组，其他的直接连接即可
// global.all.function
// global.all.functions.entrance
function getAll() {
  global.all = {};
  all.function = {};
  all.functions = {};

  // 这里可能有重复的 key 需要手动处理一下
  for (const k of [
    ...new Set([
      ...Object.keys(command.function),
      ...Object.keys(master.function),
    ]),
  ]) {
    all.function[k] = [
      ...new Set([
        ...(command.function[k] || []),
        ...(master.function[k] || []),
      ]),
    ];
  }

  // 这里没有重复的 key 直接连接即可
  all.functions.entrance = {
    ...command.functions.entrance,
    ...master.functions.entrance,
  };
}

// global.command.usage
// global.master.usage
function getUsage() {
  makeUsage(command);
  makeUsage(master);
}

async function readConfig() {
  readSettingGreetingMenu();
  readCommand();
  readAlias();
  getUsage();
  getAll();
}

function hasEntrance(message, plugin, ...entrance) {
  const messageu = message.toLowerCase();

  if (all.function[plugin]) {
    for (const e of entrance) {
      // 验证 entrance 是否在插件中
      if (!all.function[plugin].includes(e)) {
        continue;
      }

      // 验证 message 是否以 entrance 对应的字符串开始（忽略大小写）
      if (Array.isArray(all.functions.entrance[e])) {
        for (const t of all.functions.entrance[e]) {
          if (t && messageu.startsWith(t.toLowerCase())) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export { readConfig, hasEntrance };
