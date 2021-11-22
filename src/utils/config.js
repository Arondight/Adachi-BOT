/* global all, alias, artifacts, command, config, eggs, master, rootdir */
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
 *     entrance: { hello_world: [ '^hello' ], eat: [ '^eat' ] },
 *     options: { eat: { apple: '苹果', banana: '香蕉', egg: '蛋' } }
 *   },
 *   function: { hello_world: [ 'hello_world' ], eat: [ 'eat' ] }
 * }
 * --------------------------------------------------------------------------
 * global.command and global.master
 * --------------------------------------------------------------------------
 * {
 *   functions: {
 *     type: { hello_world: 'command', eat: 'option' },
 *     show: { hello_world: true, eat: true },
 *     weights: { hello_world: 9999, eat: 9999 },
 *     name: { hello_world: 'hello world', eat: 'eat' },
 *     usage: { hello_world: undefined, eat: undefined },
 *     description: { hello_world: 'I will say hello to you', eat: 'What to eat' },
 *     entrance: { hello_world: [ '^hello' ], eat: [ '^eat' ] },
 *     options: { eat: { apple: '苹果', banana: '香蕉', egg: '蛋' } }
 *   },
 *   enable: { hello_world: true, eat: true },
 *   weights: { hello_world: 9999, eat: 9999 },
 *   regex: {
 *     '^hello\\sworld(!)?\\s*$': [ 'hello_world' ],
 *     '^eat\\s*\\S+\\s*$': [ 'eat' ]
 *   },
 *   function: { hello_world: [ 'hello_world' ], eat: [ 'eat' ] },
 *   usage: '🔘 hello world 👉 I will say hello to you\n' +
 *     '🔘 eat <苹果、香蕉、蛋> 👉 What to eat\n' +
 *     '-------------------\n' +
 *     '<> 表示必填，[] 表示可选'
 * }
 * --------------------------------------------------------------------------
 * ../../config/command*.yml
 * --------------------------------------------------------------------------
 * Hello_World:
 *   enable: true
 *   weights: 9999
 *   regex:
 *     - ^hello\sworld(!)?\s*$
 *   functions:
 *     Hello_World:
 *       type: command
 *       show: true
 *       weights: 9999
 *       name: hello world
 *       usage:
 *       description: I will say hello to you
 *       entrance:
 *         - ^hello
 * Eat:
 *   enable: true
 *   weights: 9999
 *   regex:
 *     - ^eat\s*\S+\s*$
 *   functions:
 *     eat:
 *       type: option
 *       show: true
 *       weights: 9999
 *       name: eat
 *       usage:
 *       description: What to eat
 *       entrance:
 *         - ^eat
 *       options:
 *         Apple: 苹果
 *         Banana: 香蕉
 *         Egg: 蛋
 * ==========================================================================
 *
 *
 * ==========================================================================
 * global.config
 * --------------------------------------------------------------------------
 * {
 *   accounts: [ { qq: 123456789, password: 123456789, platform: 5 } ],
 *   masters: [ 987654321 ],
 *   prefixes: [ null ],
 *   atMe: 1,
 *   atUser: 1,
 *   repeatProb: 100,
 *   groupHello: 1,
 *   groupGreetingNew: 1,
 *   friendGreetingNew: 1,
 *   characterTryGetDetail: 1,
 *   requestInterval: 0,
 *   deleteGroupMsgTime: 0,
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
 *   menu: { breakfast: [ '萝卜时蔬汤' ], lunch: [ '蜜酱胡萝卜煎肉' ], dinner: [ '渡来禽肉' ] }
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
 * requestInterval: 0
 * deleteGroupMsgTime: 0
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
 *   character: { '猫': '迪奥娜', dio: '迪奥娜', '迪奥娜': '迪奥娜' },
 *   weapon: { '柴火棍': '护摩之杖', homo: '护摩之杖', '护摩之杖': '护摩之杖' },
 *   all: {
 *     '猫': '迪奥娜',
 *     dio: '迪奥娜',
 *     '迪奥娜': '迪奥娜',
 *     '柴火棍': '护摩之杖',
 *     homo: '护摩之杖',
 *     '护摩之杖': '护摩之杖'
 *   },
 *   characterNames: {
 *     '猫': '0000101110010000100001000000100000000010000000000000100000000000',
 *     '迪奥娜': '1010111110111001110000000100110010000110100000011010100000000000',
 *     dio: '1100101010101000001000110001100011110100011011100011000000000000'
 *   },
 *   weaponNames: {
 *     '柴火棍': '1010111110000001110000000100110010000110000000101001000000000000',
 *     '护摩之杖': '1010111110000111000001000100110010000110001111110101000000000000',
 *     homo: '0100000000101101000100011100110001111110011011111000110000000000'
 *   },
 *   allNames: {
 *     '猫': '0000101110010000100001000000100000000010000000000000100000000000',
 *     '迪奥娜': '1010111110111001110000000100110010000110100000011010100000000000',
 *     dio: '1100101010101000001000110001100011110100011011100011000000000000',
 *     '柴火棍': '1010111110000001110000000100110010000110000000101001000000000000',
 *     '护摩之杖': '1010111110000111000001000100110010000110001111110101000000000000',
 *     homo: '0100000000101101000100011100110001111110011011111000110000000000'
 *   }
 * }
 * --------------------------------------------------------------------------
 * ../../config/alias.yml
 * --------------------------------------------------------------------------
 * character:
 *   迪奥娜: [ 猫, dio ]
 * weapon:
 *   护摩之杖: [ 柴火棍, homo ]
 * ==========================================================================
 *
 *
 * ==========================================================================
 * global.artifacts
 * --------------------------------------------------------------------------
 * {
 *   weights: [
 *     [ 0, 0, 0, 0, 0 ],
 *     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
 *     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
 *     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
 *     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
 *     [ 0, 0 ],
 *     [ 0, 0, 0, 0 ]
 *   ],
 *   values: [
 *     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
 *     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
 *     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
 *     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 *   ],
 *   artifacts: {
 *     id: { '悠古的磐岩': 0 },
 *     rarity: { '0': 5 },
 *     suit: { '0': '悠古的磐岩' },
 *     names: { '0': [ '盘陀裂生之花', '嵯峨群峰之翼', '星罗圭壁之晷', '巉岩琢塑之樽', '不动玄石之相' ] }
 *   },
 *   domains: {
 *     id: { '世界boss挑战': 0 },
 *     name: { '0': '世界boss挑战' },
 *     alias: { boss: '世界boss挑战' },
 *     aliasOf: { '0': [ 'boss' ] },
 *     product: { '0': [ 4, 13 ] }
 *   }
 * }
 * --------------------------------------------------------------------------
 * ../../config/artifacts.yml
 * --------------------------------------------------------------------------
 * weights:
 *   - [ 0, 0, 0, 0, 0 ]
 *   - [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 *   - [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 *   - [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 *   - [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 *   - [ 0, 0 ]
 *   - [ 0, 0, 0, 0 ]
 * values:
 *   - [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 *   - [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 *   - [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 *   - [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
 * artifacts:
 *   - id: 0
 *     rarity: 5
 *     suit: 悠古的磐岩
 *     names: [ 盘陀裂生之花, 嵯峨群峰之翼, 星罗圭壁之晷, 巉岩琢塑之樽, 不动玄石之相 ]
 * domains:
 *   - id: 0
 *     name: 世界BOSS挑战
 *     alias: [ boss ]
 *     product: [ 4, 13 ]
 * ==========================================================================
 *
 *
 * ==========================================================================
 * global.eggs
 * --------------------------------------------------------------------------
 * { type: { '刻晴': '角色', '天空之刃': '武器' }, star: { '刻晴': 5, '天空之刃': 5 } }
 * --------------------------------------------------------------------------
 * ../../config/pool_eggs.yml
 * --------------------------------------------------------------------------
 * items:
 *   -
 *     type: 角色
 *     star: 5
 *     names:
 *       - 刻晴
 *   -
 *     type: 武器
 *     star: 5
 *     names:
 *       - 天空之刃
 * ==========================================================================
 *
 *
 * ==========================================================================
 *                            以上为数据结构
 * ========================================================================== */

import url from "url";
import path from "path";
import fs from "fs";
import lodash from "lodash";
import { mkdir } from "./file.js";
import { simhash } from "./tools.js";
import { loadYML } from "./yaml.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.alias = {};
global.all = {};
global.artifacts = {};
global.command = {};
global.config = {};
global.eggs = {};
global.master = {};
global.rootdir = path.resolve(__dirname, "..", "..");

const Alias = loadYML("alias");
const Artifacts = loadYML("artifacts");
const Command = loadYML("command");
const Cookies = loadYML("cookies");
const Eggs = loadYML("pool_eggs");
const Greeting = loadYML("greeting");
const Master = loadYML("command_master");
const Menu = loadYML("menu");
const Setting = loadYML("setting");

// global[key].enable                -> plugin (lowercase):    is_enabled (boolean)
// global[key].weights               -> plugin (lowercase):    weights (number)
// global[key].regex                 -> regex (lowercase):     plugin (string)
// global[key].function              -> function (lowercase):  plugin (array of string, lowercase)
// global[key].functions.type        -> function (lowercase):  type (string)
// global[key].functions.show        -> function (lowercase):  is_show (boolean)
// global[key].functions.weights     -> function (lowercase):  weights (number)
// global[key].functions.name        -> function (lowercase):  name (string)
// global[key].functions.usage       -> function (lowercase):  usage (string)
// global[key].functions.description -> function (lowercase):  description (string)
// global[key].functions.entrance    -> function (lowercase):  entrance (array of string, lowercase)
// global[key].functions.options     -> function (lowercase):  { { option: text } } (both lowercase)
function getCommand(obj, key) {
  const reduce = (obj, key, lowercase = [false, false], defaultValue = undefined, revert = false) =>
    lodash.reduce(
      obj,
      (p, v, k) => {
        if (key) {
          let p1 = k;
          let p2 = v[key];

          if (true === lowercase[0]) {
            p1 = "string" === typeof k ? k.toLowerCase() : k;
          }
          if (true === lowercase[1]) {
            p2 = "string" === typeof v[key] ? v[key].toLowerCase() : v[key];
          }

          if (true === revert) {
            if (undefined !== p2) {
              p[p2] = p1;
            }
          } else {
            if (undefined !== p1) {
              p[p1] = undefined === p2 ? defaultValue : p2;
            }
          }

          return p;
        }
      },
      {}
    );

  const deepReduce = (obj, key, lowercase = [false, false], defaultValue = undefined, revert = false) =>
    lodash.reduce(
      obj,
      (p, v, k) => {
        if (key) {
          (v[key] ? (Array.isArray(v[key]) ? v[key] : Object.entries(v[key] || {})) : []).forEach((c) => {
            const transToLowerCase = (o) => {
              if ("string" === typeof o) {
                return o.toLowerCase();
              } else if (Array.isArray(o)) {
                return lodash.transform(o, (r, c) => r.push("string" === typeof c ? c.toLowerCase() : c));
              } else {
                return lodash.transform(o, (r, v, k) => {
                  r[(k = "string" === typeof k ? k.toLowerCase() : k)] = "string" === typeof v ? v.toLowerCase() : v;
                });
              }
            };
            let p1 = true === lowercase[0] ? transToLowerCase(k) : k;
            let p2 = true === lowercase[1] ? transToLowerCase(c) : c;

            if (true === revert) {
              if (undefined !== p2) {
                (undefined === p[p2] ? (p[p2] = []) : p[p2]).push(p1);
              }
            } else {
              if (undefined !== p1) {
                (undefined === p[p1] ? (p[p1] = []) : p[p1]).push(undefined === p2 ? defaultValue : p2);
              }
            }
          });
          return p;
        }
      },
      {}
    );

  if (!["command", "master"].includes(key)) {
    return;
  }

  global[key].enable = reduce(obj, "enable", [true, false], false);
  global[key].weights = reduce(obj, "weights", [true, false], 0);
  global[key].regex = deepReduce(obj, "regex", [true, false], undefined, true);
  global[key].function = deepReduce(obj, "functions", [true, true]);

  global[key].functions = {};

  for (const name in obj) {
    const add = (obj, key, name, prop, callback, ...rest) => {
      global[key].functions[prop] = lodash.assign(
        global[key].functions[prop] || {},
        callback(obj[name].functions, prop, ...rest)
      );
    };

    add(obj, key, name, "type", reduce, [true, false], 0);
    add(obj, key, name, "show", reduce, [true, false], true);
    add(obj, key, name, "weights", reduce, [true, false], 0);
    add(obj, key, name, "name", reduce, [true, false]);
    add(obj, key, name, "usage", reduce, [true, false]);
    add(obj, key, name, "description", reduce, [true, false]);
    add(obj, key, name, "entrance", deepReduce, [true, true]);
    add(obj, key, name, "options", deepReduce, [true, true]);
  }

  global[key].function = lodash.reduce(
    global[key].function,
    (p, v, k) => {
      v.forEach((c) => (p[k] || (p[k] = [])).push(c[0]));
      return p;
    },
    {}
  );

  global[key].functions.options = lodash.reduce(
    global[key].functions.options,
    (p, v, k) => {
      v.forEach((c) => {
        c[1] = c[1].toString();
        lodash.assign(p[k] || (p[k] = {}), {
          [c[0]]: "string" === typeof c[1] ? c[1].toLowerCase() : c[1],
        });
      });
      return p;
    },
    {}
  );

  // 所有 switch 转换为 option
  // https://github.com/Arondight/Adachi-BOT/issues/242
  if (global[key].functions.type) {
    Object.keys(global[key].functions.type).forEach((f) => {
      if ("switch" === global[key].functions.type[f]) {
        global[key].functions.type[f] = "option";
        global[key].functions.options[f] = lodash
          .chain({})
          .assign({ on: "on" }, { off: "off" }, global[key].functions.options[f] || {})
          .pick(["on", "off"])
          .value();
      }
    });
  }
}

// obj: command or master
function makeUsage(obj) {
  if (!(obj === command || obj === master)) {
    return "";
  }

  const listMark = "🔘";
  const commentMark = "👉";
  const pluginList = new Map(Object.entries(obj.weights).sort((a, b) => b[1] - a[1]));
  let text = "";

  for (const plugin of pluginList.keys()) {
    let functionWeights = {};

    if (!obj.enable[plugin]) {
      continue;
    }

    for (const k in obj.functions.weights) {
      if (obj.function[plugin].includes(k)) {
        functionWeights[k] = obj.functions.weights[k];
      }
    }

    const functionList = new Map(Object.entries(functionWeights).sort((a, b) => b[1] - a[1]));

    for (const func of functionList.keys()) {
      if (true === obj.functions.show[func] && obj.functions.name[func]) {
        const type = obj.functions.type[func] || "command";

        text +=
          listMark +
          " " +
          obj.functions.name[func] +
          " " +
          (obj.functions.usage[func] ? obj.functions.usage[func] + " " : "") +
          ("option" === type
            ? (obj.functions.options[func] && "<" + Object.values(obj.functions.options[func]).join("、")) + "> "
            : "") +
          (obj.functions.description[func] ? commentMark + " " : "") +
          (obj.functions.description[func] || "") +
          "\n";
      }
    }
  }

  text += text ? "-------------------\n<> 表示必填，[] 表示可选" : "我什么都不会哦。";

  obj.usage = text;
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
    // 耗时操作前不发送提示
    warnTimeCosts: 0,
    // 不对用户的使用频率作出限制
    requestInterval: 0,
    // 不尝试撤回发送的群消息
    deleteGroupMsgTime: 0,
    // 深渊记录缓存一小时
    cacheAbyEffectTime: 1,
    // 玩家数据缓存一小时
    cacheInfoEffectTime: 1,
    // 数据库 aby 的数据有效性为一小时
    dbAbyEffectTime: 1,
    // 数据库 info 的数据有效性为一星期
    dbInfoEffectTime: 168,
    // 不使用前端调试模式
    viewDebug: 0,
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
  const repeatProb = parseInt(parseFloat(Setting.repeatProb) * 100);
  const groupHello = parseInt(Setting.groupHello);
  const groupGreetingNew = parseInt(Setting.groupGreetingNew);
  const friendGreetingNew = parseInt(Setting.friendGreetingNew);
  const characterTryGetDetail = parseInt(Setting.characterTryGetDetail);
  const warnTimeCosts = parseInt(Setting.warnTimeCosts);
  const requestInterval = parseInt(Setting.requestInterval);
  const deleteGroupMsgTime = parseInt(Setting.deleteGroupMsgTime);
  const cacheAbyEffectTime = parseInt(Setting.cacheAbyEffectTime);
  const cacheInfoEffectTime = parseInt(Setting.cacheInfoEffectTime);
  const dbAbyEffectTime = parseInt(Setting.dbAbyEffectTime);
  const dbInfoEffectTime = parseInt(Setting.dbInfoEffectTime);
  const viewDebug = parseInt(Setting.viewDebug);
  const cookies = Cookies ? (Array.isArray(Cookies.cookies) ? Cookies.cookies : []) : [];
  const greetingOnline = Greeting.online;
  const greetingDie = Greeting.die;
  const greetingHello = Greeting.hello;
  const greetingNew = Greeting.new;
  const menu = Menu;

  const getConfig = (...pairs) => {
    pairs &&
      pairs.forEach((p) => {
        const prop = Object.keys(p)[0];
        const val = p[prop];

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
    { warnTimeCosts },
    { requestInterval },
    { deleteGroupMsgTime },
    { cacheAbyEffectTime },
    { cacheInfoEffectTime },
    { dbAbyEffectTime },
    { dbInfoEffectTime },
    { viewDebug },
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

  // menu 中每个值均为数组
  Object.keys(config.menu).forEach(
    (k) => (config.menu[k] = Array.isArray(config.menu[k]) ? config.menu[k] : config.menu[k] ? [config.menu[k]] : [])
  );
}

// global.alias.character       ->  alias (lowercase): character (string, lowercase)
// global.alias.weapon          ->  alias (lowercase): weapon (string, lowercase)
// global.alias.all             ->  alias (lowercase): name (string, lowercase)
// global.alias.characterNames  ->  { name: simhash } (name lowercase)
// global.alias.weaponNames     ->  { name: simhash } (name lowercase)
// global.alias.allNames        ->  { name: simhash } (name lowercase)
function readAlias() {
  const getSection = (s) =>
    lodash.reduce(
      Alias[s] || {},
      (p, v, k) => {
        (v || (v = [])).push(k);
        v.forEach((c) => (p["string" === typeof c ? c.toLowerCase() : c] = k));
        return p;
      },
      {}
    );
  const getNames = (o) =>
    lodash
      .chain(o)
      .toPairs()
      .flatten()
      .uniq()
      .map((c) => [c, simhash(c)])
      .fromPairs()
      .value();

  alias.character = getSection("character");
  alias.weapon = getSection("weapon");
  alias.all = lodash.assign({}, alias.character, alias.weapon);
  alias.characterNames = getNames(alias.character);
  alias.weaponNames = getNames(alias.weapon);
  alias.allNames = getNames(alias.all);
}

// eggs.type: name -> type (string)
// eggs.star: name -> type (string)
function readEggs() {
  eggs.type = {};
  eggs.star = {};

  Array.isArray(Eggs.items) &&
    Eggs.items.forEach((c) => {
      if (Array.isArray(c.names)) {
        const star = parseInt(c.star) || 5;
        c.type && c.names.forEach((n) => (eggs.type[n] = c.type));
        c.names.forEach((n) => (eggs.star[n] = star));
      }
    });
}

// artifacts.weights          -> weights (array of array of number)
// artifacts.values           -> values (array of array of number)
// artifacts.artifacts.id     -> suit (lowercase):  id (number)
// artifacts.artifacts.rarity -> id:                rarity (number)
// artifacts.artifacts.suit   -> id:                suit (string, lowercase)
// artifacts.artifacts.names  -> id:                names (array of string, lowercase)
// artifacts.domains.id       -> name (lowercase):  id (number)
// artifacts.domains.name     -> id:                name (string, lowercase)
// artifacts.domains.alias    -> alias (lowercase): name (string, lowercase)
// artifacts.domains.aliasOf  -> id:                alias (array of string, lowercase)
// artifacts.domains.product  -> id:                product (array of number)
function readArtifacts() {
  const reduce = (prop, key = [undefined, undefined], lowercase = [false, false]) =>
    key.includes(undefined) ||
    lodash.reduce(
      Artifacts[prop] || [],
      (p, v) => {
        let p1 = v[key[0]];
        let p2 = v[key[1]];

        if (true === lowercase[0]) {
          p1 = "string" === typeof p1 ? p1.toLowerCase() : p1;
        }
        if (true === lowercase[1]) {
          p2 = "string" === typeof p2 ? p2.toLowerCase() : Array.isArray(p2) ? p2.map((c) => c.toLowerCase()) : p2;
        }

        p[p1] = p2;
        return p;
      },
      {}
    );
  const deepReduce = (prop, key = [undefined, undefined], lowercase = [false, false]) =>
    key.includes(undefined) ||
    lodash.reduce(
      Artifacts[prop] || [],
      (p, v) => {
        (v[key[0]] || []).forEach((c) => {
          (Array.isArray(c) ? c : [c]).forEach((c) => {
            let p1 = c;
            let p2 = v[key[1]];

            if (true === lowercase[0]) {
              p1 = "string" === typeof p1 ? p1.toLowerCase() : p1;
            }
            if (true === lowercase[1]) {
              p2 = "string" === typeof p2 ? p2.toLowerCase() : Array.isArray(p2) ? p2.map((c) => c.toLowerCase()) : p2;
            }

            p[p1] = p2;
          });
        });
        return p;
      },
      {}
    );

  artifacts.weights = Artifacts.weights;

  artifacts.values = Artifacts.values;

  artifacts.artifacts = {};
  artifacts.artifacts.id = reduce("artifacts", ["suit", "id"], [true, false]);
  artifacts.artifacts.rarity = reduce("artifacts", ["id", "rarity"], [false, false]);
  artifacts.artifacts.suit = reduce("artifacts", ["id", "suit"], [false, true]);
  artifacts.artifacts.names = reduce("artifacts", ["id", "names"], [false, true]);

  artifacts.domains = {};
  artifacts.domains.id = reduce("domains", ["name", "id"], [true, false]);
  artifacts.domains.name = reduce("domains", ["id", "name"], [false, true]);
  artifacts.domains.alias = deepReduce("domains", ["alias", "name"], [true, true]);
  artifacts.domains.aliasOf = reduce("domains", ["id", "alias"], [false, true]);
  artifacts.domains.product = reduce("domains", ["id", "product"], [false, false]);
}

// global.command
// global.master
function readCommand() {
  getCommand(Command, "command");
  getCommand(Master, "master");
}

// global.all.function
// global.all.functions.options
// global.all.functions.entrance
// global.all.function
// global.all.functions.entrance
function getAll() {
  const merge = (o, p, o1, o2) => {
    o[p] = {};
    // 这里可能有重复的 key 需要手动处理一下
    for (const k of [...new Set([...Object.keys(o1 || {}), ...Object.keys(o2 || {})])]) {
      o[p][k] = [...new Set([...((o1 || {})[k] || []), ...((o2 || {})[k] || [])])];
    }
  };

  all.functions = {};
  all.functions.options = lodash.assign({}, command.functions.options, master.functions.options);
  merge(all, "function", command.function, master.function);
  merge(all.functions, "entrance", command.functions.entrance, master.functions.entrance);
}

// global.command.usage
// global.master.usage
function getUsage() {
  makeUsage(command);
  makeUsage(master);
}

// For /src/views/*
function writeViewsConfig() {
  const dir = path.join(rootdir, "data", "config");
  const data = { rootdir };

  fs.writeFileSync(path.resolve(mkdir(dir), "views.json"), JSON.stringify(data), "utf8");
}

function readConfig() {
  readSettingCookiesGreetingMenu();
  readAlias();
  readEggs();
  readArtifacts();
  readCommand();
  getAll();
  getUsage();
  writeViewsConfig();
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
          if (t) {
            if (new RegExp(t, "i").test(messageu)) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

export { hasEntrance, readConfig };
