/* global all, artifacts, command, config, master */
/* eslint no-undef: "error" */

/* ==========================================================================
 *                            以下为数据结构
 * ==========================================================================
 *
 *
 * ==========================================================================
 * rootdir
 * --------------------------------------------------------------------------
 * '/path/to/Adachi-BOT'
 * ==========================================================================
 *
 *
 * ==========================================================================
 * global.all
 * --------------------------------------------------------------------------
 * {
 *   function: {
 *     hello_world: [ 'hello_world' ]
 *   },
 *   functions: {
 *     entrance: {
 *       hello_world: [ 'hello world' ]
 *     }
 *   }
 * }
 * --------------------------------------------------------------------------
 * global.command and global.master
 * --------------------------------------------------------------------------
 * {
 *   functions: {
 *     weights: {
 *       hello_world: 9999
 *     },
 *     name: {
 *       hello_world: 'hello world'
 *     },
 *     usage: {
 *       hello_world: undefined
 *     },
 *     description: {
 *       hello_world: 'I will say hello to you'
 *     },
 *     entrance: {
 *       hello_world: [ 'hello world' ]
 *     }
 *   },
 *   enable: {
 *     hello_world: true
 *   },
 *   weights: {
 *     hello_world: 9999
 *   },
 *   regex: {
 *     '^hello\\sworld(!)?\\s*$': [ 'hello_world' ]
 *   },
 *   function: {
 *     hello_world: [ 'hello_world' ]
 *   },
 *   usage: '🔘 hello world  👉 I will say hello to you\n' +
 *     '-------------------\n' +
 *     '<> 表示必填，[] 表示可选，前面需加空格'
 * }
 * --------------------------------------------------------------------------
 * ../../config/command*.yml
 * --------------------------------------------------------------------------
 * Hello_World:
 *   enable: true
 *   weights: 9999
 *   regex:
 *     - ^HELLO\sworld(!)?\s*$
 *   functions:
 *     Hello_World:
 *       weights: 9999
 *       name: hello world
 *       usage:
 *       description: I will say hello to you
 *       entrance:
 *         - hello WORLD
 * ==========================================================================
 *
 *
 * ==========================================================================
 * global.config
 * --------------------------------------------------------------------------
 * {
 *   accounts: [
 *     {
 *       qq: 123456789,
 *       password: 123456789,
 *       platform: 5
 *     }
 *   ],
 *   masters: [ 987654321 ],
 *   prefixes: [ null ],
 *   atMe: 1,
 *   atUser: 1,
 *   repeatProb: 1,
 *   groupHello: 1,
 *   groupGreetingNew: 1,
 *   friendGreetingNew: 1,
 *   cacheAbyEffectTime: 1,
 *   cacheInfoEffectTime: 1,
 *   dbAbyEffectTime: 1,
 *   dbInfoEffectTime: 168,
 *   greetingOnline: '上线了。',
 *   greetingDie: '上线了，但又没上。',
 *   greetingHello: '大家好。',
 *   greetingNew: '向你问好。',
 *   menu: {
 *     breakfast: [ '萝卜时蔬汤' ],
 *     lunch: [ '蜜酱胡萝卜煎肉' ],
 *     dinner: [ '渡来禽肉' ]
 *   }
 * }
 * --------------------------------------------------------------------------
 * ../../config/setting.yml
 * --------------------------------------------------------------------------
 * accounts:
 *   -
 *     qq: 123456789
 *     password: 123456789
 *     platform: 5
 * masters:
 *   - 987654321
 * atMe: 1
 * atUser: 1
 * repeatProb: 1
 * groupHello: 1
 * groupGreetingNew: 1
 * friendGreetingNew: 1
 * prefixes:
 *   -
 * cacheAbyEffectTime: 1
 * cacheInfoEffectTime: 1
 * dbAbyEffectTime: 1
 * dbInfoEffectTime: 168
 * --------------------------------------------------------------------------
 * ../../config/greeting.yml
 * --------------------------------------------------------------------------
 * online: 上线了。
 * die: 上线了，但又没上。
 * hello: 大家好。
 * new: 向你问好。
 * --------------------------------------------------------------------------
 * ../../config/menu.yml
 * --------------------------------------------------------------------------
 * breakfast:
 *   - 萝卜时蔬汤
 * lunch:
 *   - 蜜酱胡萝卜煎肉
 * dinner:
 *   - 渡来禽肉
 * ==========================================================================
 *
 *
 * ==========================================================================
 * global.alias
 * --------------------------------------------------------------------------
 * {
 *   '77': '七七',
 *   '冰猫': '迪奥娜',
 *   'dio娜': '迪奥娜',
 *   dio: '迪奥娜'
 * }
 * --------------------------------------------------------------------------
 * ../../config/alias.yml
 * --------------------------------------------------------------------------
 * 迪奥娜:
 *   - 冰猫
 *   - Dio娜
 *   - DIO
 * 七七:
 *   - 77
 * ==========================================================================
 *
 *
 * ==========================================================================
 * global.artifacts
 * --------------------------------------------------------------------------
 * {
 *   domains: {
 *     name: {
 *      '铭记之谷': 2
 *     },
 *     alias: {
 *       '风本': '铭记之谷',
 *       '奶本': '铭记之谷',
 *       '风奶本': '铭记之谷'
 *     }
 *   }
 * }
 * --------------------------------------------------------------------------
 * ../../config/artifacts.yml
 * --------------------------------------------------------------------------
 * domains:
 *   -
 *     id: 2
 *     name: 铭记之谷
 *     alias: [ 风本, 奶本, 风奶本 ]
 *     product: [ 7, 12 ]
 * ==========================================================================
 *
 *
 * ==========================================================================
 *                            以上为数据结构
 * ========================================================================== */

import lodash from "lodash";
import url from "url";
import path from "path";
import { loadYML } from "./yaml.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Setting = loadYML("setting");
const Greeting = loadYML("greeting");
const Command = loadYML("command");
const Master = loadYML("command_master");
const Alias = loadYML("alias");
const Menu = loadYML("menu");
const Artifacts = loadYML("artifacts");

// global[key].enable                -> plugin (lowercase):    is_enabled (boolean)
// global[key].weights               -> plugin (lowercase):    weights (number)
// global[key].regex                 -> regex (lowercase):     plugin (string, lowercase)
// global[key].function              -> function (lowercase):  plugin (array of string, lowercase)
// global[key].functions.weights     -> function (lowercase):  weights (number)
// global[key].functions.name        -> function (lowercase):  name (string, lowercase)
// global[key].functions.usage       -> function (lowercase):  usage (string)
// global[key].functions.description -> function (lowercase):  description (string)
// global[key].functions.entrance    -> function (lowercase):  entrance (array of string, lowercase)
function getCommand(obj, key) {
  const map = (
    object,
    key,
    lowercase = [false, false],
    defaultValue = undefined,
    revert = false
  ) =>
    lodash.reduce(
      object,
      (pair, v, k) => {
        let p1 = k;
        let p2 = v[key];

        lowercase[0] && (p1 = "string" === typeof k ? k.toLowerCase() : k);
        lowercase[1] &&
          (p2 = "string" === typeof v[key] ? v[key].toLowerCase() : v[key]);

        if (true === revert) {
          p2 && (pair[p2] = p1);
        } else {
          p1 && (pair[p1] = p2 || defaultValue);
        }
        return pair;
      },
      {}
    );
  const mapSub = (
    object,
    key,
    lowercase = [false, false],
    defaultValue = undefined,
    revert = false
  ) =>
    lodash.reduce(
      object,
      (pair, v, k) => {
        (v[key]
          ? Array.isArray(v[key])
            ? v[key]
            : Object.keys(v[key] || {})
          : []
        ).forEach((c) => {
          let p1 = k;
          let p2 = c;

          lowercase[0] && (p1 = "string" === typeof k ? k.toLowerCase() : k);
          lowercase[1] && (p2 = "string" === typeof c ? c.toLowerCase() : c);

          if (true === revert) {
            p2 && (pair[p2] || (pair[p2] = [])).push(p1);
          } else {
            p1 && (pair[p1] || (pair[p1] = [])).push(p2 || defaultValue);
          }
        });
        return pair;
      },
      {}
    );

  global[key] = {};
  global[key].functions = {};
  global[key].enable = map(obj, "enable", [true, false], false);
  global[key].weights = map(obj, "weights", [true, false], 0);
  global[key].regex = mapSub(obj, "regex", [true, true], undefined, true);
  global[key].function = mapSub(obj, "functions", [true, true]);

  for (const name in obj) {
    const add = (obj, key, name, prop, callback, ...rest) => {
      global[key].functions[prop] = lodash.assign(
        global[key].functions[prop] || {},
        callback(obj[name].functions, prop, ...rest)
      );
    };

    add(obj, key, name, "weights", map, [true, false], 0);
    add(obj, key, name, "name", map, [true, true]);
    add(obj, key, name, "usage", map, [true, false]);
    add(obj, key, name, "description", map, [true, false]);
    add(obj, key, name, "entrance", mapSub, [true, true]);
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
      if (object.functions.name[func]) {
        text += `${listMark} ${object.functions.name[func]} ${
          object.functions.usage[func] || ""
        } ${object.functions.description[func] ? commentMark : ""} ${
          object.functions.description[func] || ""
        }\n`;
      }
    }
  }

  text += text
    ? "-------------------\n<> 表示必填，[] 表示可选，前面需加空格"
    : "我什么都不会哦。";

  object.usage = text;
}

function setRootDir() {
  global.rootdir = path.resolve(__dirname, "..", "..");
}

// global.config
function readSettingGreetingMenu() {
  // 此为配置文件中没有对应字段或者用户配置了无效的值时，对应字段的默认值
  const defaultConfig = {
    // 登录协议为 iPad
    platform: 5,
    // 不允许 @ 机器人
    atMe: 0,
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

  const account = Setting["account"];
  const accounts = Setting["accounts"];
  // 用于兼容旧配置，已经被 masters 取代
  const master = Setting["master"];
  const masters = Setting["masters"];
  const prefixes = Setting["prefixes"];
  const atMe = parseInt(Setting["atMe"]);
  const atUser = parseInt(Setting["atUser"]);
  const repeatProb = parseInt(Setting["repeatProb"]);
  const groupHello = parseInt(Setting["groupHello"]);
  const groupGreetingNew = parseInt(Setting["groupGreetingNew"]);
  const friendGreetingNew = parseInt(Setting["friendGreetingNew"]);
  const cacheAbyEffectTime = parseInt(Setting["cacheAbyEffectTime"]);
  const cacheInfoEffectTime = parseInt(Setting["cacheInfoEffectTime"]);
  const dbAbyEffectTime = parseInt(Setting["dbAbyEffectTime"]);
  const dbInfoEffectTime = parseInt(Setting["dbInfoEffectTime"]);
  const greetingOnline = Greeting["online"];
  const greetingDie = Greeting["die"];
  const greetingHello = Greeting["hello"];
  const greetingNew = Greeting["new"];
  const menu = Menu;

  global.config = {};

  const getConfig = (...pairs) => {
    pairs &&
      pairs.forEach((pair) => {
        const prop = Object.keys(pair)[0];
        const val = pair[prop];

        if (undefined === defaultConfig[prop]) {
          config[prop] = val;
        }
        config[prop] = val || defaultConfig[prop];
      });
  };

  getConfig(
    { accounts: [...(accounts || []), ...(account ? [account] : [])] },
    { masters: [...(masters || []), ...(master ? [master] : [])] },
    {
      prefixes: Array.isArray(prefixes) ? prefixes : prefixes ? [prefixes] : [],
    },
    { atMe },
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

  // 设置每个 QQ 账户的登录选项默认值
  for (const option of config.accounts) {
    // 1:安卓手机、 2:aPad 、 3:安卓手表、 4:MacOS 、 5:iPad
    if (![1, 2, 3, 4, 5].includes(option.platform)) {
      option.platform = defaultConfig.platform;
    }
  }

  // 转化每个不为 null 的命令前缀的数据类型为 string
  for (const i in config.prefixes) {
    if (config.prefixes[i]) {
      config.prefixes[i] = config.prefixes[i].toString();
    }
  }

  // 设置选项 atMe 的默认值
  if (![0, 1, 2].includes(config.atMe)) {
    config.atMe = defaultConfig.atMe;
  }
}

// global.alias ->  alias (lowercase): name (string)
function readAlias() {
  global.alias = lodash.reduce(
    Alias,
    (pair, v, k) => {
      (v || []).forEach(
        (c) => (pair["string" === typeof c ? c.toLowerCase() : c] = k)
      );
      return pair;
    },
    {}
  );
}

// artifacts.domains.name -> name (lowercase): id (number)
// artifacts.domains.alias -> alias (lowercase): name (string, lowercase)
function readArtifacts() {
  global.artifacts = {};
  artifacts.domains = {};
  artifacts.domains.name = lodash.reduce(
    Artifacts.domains || [],
    (pair, v) => {
      pair["string" === typeof v.name ? v.name.toLowerCase() : v.name] = v.id;
      return pair;
    },
    {}
  );
  artifacts.domains.alias = lodash.reduce(
    Artifacts.domains || [],
    (pair, v) => {
      (v.alias || []).forEach(
        (c) =>
          (pair["string" === typeof c ? c.toLowerCase() : c] =
            "string" === typeof v.name ? v.name.toLowerCase() : v.name)
      );
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
  setRootDir();
  readSettingGreetingMenu();
  readCommand();
  readAlias();
  readArtifacts();
  getUsage();
  getAll();
}

function hasEntrance(message, plugin, ...entrance) {
  const messageu = message.toLowerCase(); // 忽略大小写

  if (all.function[plugin]) {
    for (const e of entrance) {
      // 验证 entrance 是否在插件中
      if (!all.function[plugin].includes(e)) {
        continue;
      }

      // 验证 message 是否以 entrance 对应的字符串开始
      if (Array.isArray(all.functions.entrance[e])) {
        for (const t of all.functions.entrance[e]) {
          if (t && messageu.startsWith(t)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export { readConfig, hasEntrance };
