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
 *   functions: {
 *     entrance: { hello_world: [ 'hello world' ], eat: [ 'eat' ] },
 *     options: { eat: [ { Apple: '苹果' }, { Banana: '香蕉' }, { Egg: '蛋' } ] }
 *   },
 *   function: { hello_world: [ 'Hello_World' ], eat: [ 'eat' ] }
 * }
 * --------------------------------------------------------------------------
 * global.command and global.master
 * --------------------------------------------------------------------------
 * {
 *   functions: {
 *     type: { hello_world: 'command', eat: 'option' },
 *     weights: { hello_world: 9999, eat: 9999 },
 *     name: { hello_world: 'hello world', eat: 'eat' },
 *     usage: { hello_world: undefined, eat: undefined },
 *     description: { hello_world: 'I will say hello to you', eat: 'What to eat' },
 *     entrance: { hello_world: [ 'hello world' ], eat: [ 'eat' ] },
 *     options: { eat: [ { apple: '苹果' }, { banana: '香蕉' }, { egg: '蛋' } ] }
 *   },
 *   enable: { hello_world: true, eat: true },
 *   weights: { hello_world: 9999, eat: 9999 },
 *   regex: {
 *     '^hello\\sworld(!)?\\s*$': [ 'hello_world' ],
 *     '^eat\\s+\\s*$': [ 'eat' ]
 *   },
 *   function: { hello_world: [ 'hello_world' ], eat: [ 'eat' ] },
 *   usage: '🔘 hello world  👉 I will say hello to you\n' +
 *     '🔘 eat <苹果、香蕉、蛋> 👉 What to eat\n' +
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
 *       type: command
 *       weights: 9999
 *       name: hello world
 *       usage:
 *       description: I will say hello to you
 *       entrance:
 *         - hello WORLD
 *
 * Eat:
 *   enable: true
 *   weights: 9999
 *   regex:
 *     - ^eat\S+\s*$
 *   functions:
 *     eat:
 *       type: option
 *       weights: 9999
 *       name: eat
 *       usage:
 *       description: What to eat
 *       entrance:
 *         - EAT
 *       options:
 *         Apple: "苹果"
 *         Banana: "香蕉"
 *         Egg: "蛋"
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
 *   characterTryGetDetail: 1,
 *   groupGreetingNew: 1,
 *   friendGreetingNew: 1,
 *   cacheAbyEffectTime: 1,
 *   cacheInfoEffectTime: 1,
 *   dbAbyEffectTime: 1,
 *   dbInfoEffectTime: 168,
 *   cookies: [
 *     'UM_distinctid=...; _ga=...; _gid=...; CNZZDATA1275023096=...; _MHYUUID=...; ltoken=...; ltuid=...; cookie_token=...; account_id=...'
 *   ],
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
 * characterTryGetDetail: 1
 * prefixes:
 *   -
 * cacheAbyEffectTime: 1
 * cacheInfoEffectTime: 1
 * dbAbyEffectTime: 1
 * dbInfoEffectTime: 168
 * --------------------------------------------------------------------------
 * ../../config/cookies.yml
 * --------------------------------------------------------------------------
 * cookies:
 *   - UM_distinctid=...; _ga=...; _gid=...; CNZZDATA1275023096=...; _MHYUUID=...; ltoken=...; ltuid=...; cookie_token=...; account_id=...
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
const Cookies = loadYML("cookies");
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
// global[key].functions.type        -> function (lowercase):  type (string)
// global[key].functions.weights     -> function (lowercase):  weights (number)
// global[key].functions.name        -> function (lowercase):  name (string)
// global[key].functions.usage       -> function (lowercase):  usage (string)
// global[key].functions.description -> function (lowercase):  description (string)
// global[key].functions.entrance    -> function (lowercase):  entrance (array of string, lowercase)
// global[key].functions.option      -> function (lowercase):  option (array of object, lowercase)
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
        if (key) {
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
        }
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
        if (key) {
          (v[key]
            ? Array.isArray(v[key])
              ? v[key]
              : Object.entries(v[key] || {})
            : []
          ).forEach((c) => {
            let p1 = k;
            let p2 = c;

            if (lowercase[0]) {
              if ("string" === typeof k) {
                p1 = k.toLowerCase();
              } else if (Array.isArray(k)) {
                p1 = lodash.transform(k, (r, c) =>
                  r.push("string" === typeof c ? c.toLowerCase() : c)
                );
              } else {
                p1 = lodash.transform(k, (r, v, k) => {
                  r[(k = "string" === typeof k ? k.toLowerCase() : k)] =
                    "string" === typeof v ? v.toLowerCase() : v;
                });
              }
            }

            if (lowercase[1]) {
              if ("string" === typeof c) {
                p2 = c.toLowerCase();
              } else if (Array.isArray(c)) {
                p2 = lodash.transform(c, (r, c) =>
                  r.push("string" === typeof c ? c.toLowerCase() : c)
                );
              } else {
                p2 = lodash.transform(c, (r, v, k) => {
                  r[(k = "string" === typeof k ? k.toLowerCase() : k)] =
                    "string" === typeof v ? v.toLowerCase() : v;
                });
              }
            }

            if (true === revert) {
              p2 && (pair[p2] || (pair[p2] = [])).push(p1);
            } else {
              p1 && (pair[p1] || (pair[p1] = [])).push(p2 || defaultValue);
            }
          });
          return pair;
        }
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

    add(obj, key, name, "type", map, [true, false], 0);
    add(obj, key, name, "weights", map, [true, false], 0);
    add(obj, key, name, "name", map, [true, false]);
    add(obj, key, name, "usage", map, [true, false]);
    add(obj, key, name, "description", map, [true, false]);
    add(obj, key, name, "entrance", mapSub, [true, true]);
    add(obj, key, name, "options", mapSub, [true, true]);
  }

  global[key].function = lodash.reduce(
    global[key].function,
    (pair, v, k) => {
      v.forEach((c) => (pair[k] || (pair[k] = [])).push(c[0]));
      return pair;
    },
    {}
  );

  global[key].functions.options = lodash.reduce(
    global[key].functions.options,
    (pair, v, k) => {
      v.forEach((c) => {
        c[1] = c[1].toString();
        (pair[k] || (pair[k] = [])).push({
          [c[0]]: "string" === typeof c[1] ? c[1].toLowerCase() : c[1],
        });
      });
      return pair;
    },
    {}
  );
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
        const type = object.functions.type[func] || "command";

        text +=
          listMark +
          " " +
          object.functions.name[func] +
          " " +
          (object.functions.usage[func]
            ? object.functions.usage[func] + " "
            : "") +
          ("switch" === type
            ? "<on、off>"
            : "option" === type
            ? (object.functions.options[func] &&
                "<" +
                  object.functions.options[func]
                    .map((p) => Object.values(p)[0])
                    .join("、")) + ">"
            : "") +
          " " +
          (object.functions.description[func] ? commentMark : "") +
          " " +
          (object.functions.description[func] || "") +
          "\n";
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
function readSettingCookiesGreetingMenu() {
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
    // 角色查询不尝试拉取数据
    characterTryGetDetail: 0,
    // 深渊记录缓存一小时
    cacheAbyEffectTime: 1,
    // 玩家数据缓存一小时
    cacheInfoEffectTime: 1,
    // 数据库 aby 的数据有效性为一小时
    dbAbyEffectTime: 1,
    // 数据库 info 的数据有效性为一星期
    dbInfoEffectTime: 168,
  };

  // 用于兼容旧配置，已经被 accounts 取代
  const account = Setting.account;
  const accounts = Setting.accounts;
  // 用于兼容旧配置，已经被 masters 取代
  const master = Setting.master;
  const masters = Setting.masters;
  const prefixes = Setting.prefixes;
  const atMe = parseInt(Setting.atMe);
  const atUser = parseInt(Setting.atUser);
  const repeatProb = parseInt(Setting.repeatProb);
  const groupHello = parseInt(Setting.groupHello);
  const groupGreetingNew = parseInt(Setting.groupGreetingNew);
  const friendGreetingNew = parseInt(Setting.friendGreetingNew);
  const characterTryGetDetail = parseInt(Setting.characterTryGetDetail);
  const cacheAbyEffectTime = parseInt(Setting.cacheAbyEffectTime);
  const cacheInfoEffectTime = parseInt(Setting.cacheInfoEffectTime);
  const dbAbyEffectTime = parseInt(Setting.dbAbyEffectTime);
  const dbInfoEffectTime = parseInt(Setting.dbInfoEffectTime);
  const cookies = Cookies
    ? Array.isArray(Cookies.cookies)
      ? Cookies.cookies
      : []
    : [];
  const greetingOnline = Greeting.online;
  const greetingDie = Greeting.die;
  const greetingHello = Greeting.hello;
  const greetingNew = Greeting.new;
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
    { characterTryGetDetail },
    { cacheAbyEffectTime },
    { cacheInfoEffectTime },
    { dbAbyEffectTime },
    { dbInfoEffectTime },
    { cookies },
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
  const merge = (o, p, o1, o2) => {
    o[p] = {};
    // 这里可能有重复的 key 需要手动处理一下
    for (const k of [
      ...new Set([...Object.keys(o1 || {}), ...Object.keys(o2 || {})]),
    ]) {
      o[p][k] = [
        ...new Set([...((o1 || {})[k] || []), ...((o2 || {})[k] || [])]),
      ];
    }
  };

  global.all = {};
  global.all.functions = {};

  merge(all, "function", command.function, master.function);
  merge(
    all.functions,
    "entrance",
    command.functions.entrance,
    master.functions.entrance
  );
  merge(
    all.functions,
    "options",
    command.functions.options,
    master.functions.options
  );
}

// global.command.usage
// global.master.usage
function getUsage() {
  makeUsage(command);
  makeUsage(master);
}

async function readConfig() {
  setRootDir();
  readSettingCookiesGreetingMenu();
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

function hasOption(func, ...options) {
  if (
    all.functions.options[func] &&
    Array.isArray(all.functions.options[func])
  ) {
    for (const o of options) {
      for (const pair of all.functions.options[func]) {
        if (Object.values(pair).indexOf(o) > -1) {
          return true;
        }
      }
    }
  }

  return false;
}

function getOption(func, option) {
  return hasOption(func, option)
    ? lodash.map(all.functions.options[func], option)
    : undefined;
}

export { readConfig, hasEntrance, hasOption, getOption };
