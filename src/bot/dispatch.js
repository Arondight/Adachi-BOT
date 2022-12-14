import { exec } from "child_process";
import lodash from "lodash";
import os from "os";
import { platform } from "process";
import { checkAuth } from "#utils/auth";
import { absPath, base64 } from "#utils/file";
import { isGroupBan, toCqcode } from "#utils/oicq";
import { getGroupOfStranger } from "#utils/oicq";
import { iconvConvert } from "#utils/tools";
import { getRandomInt } from "#utils/tools";

("use strict");

// 无需加锁
const mTimestamp = {};

async function doPossibleCommand(msg, plugins, type, bot) {
  async function doQa(msg) {
    if (!checkAuth(msg, global.innerAuthName.qa, false)) {
      return;
    }

    for (const [regex, option] of Object.entries(global.qa)) {
      let flag = "m";

      if (true === option.ignoreCase) {
        flag = `${flag}i`;
      }

      const r = new RegExp(regex, flag);
      const id = "group" === type ? msg.gid : msg.uid;

      if (r.test(msg.raw_message)) {
        if (true === option.master && !global.config.masters.includes(msg.user_id)) {
          bot.say(msg.sid, "此问答功能仅供管理者使用。", type, msg.uid);
          break;
        }

        const osMatch =
          undefined === option.platform ||
          null === option.platform ||
          (Array.isArray(option.platform) && option.platform.includes(platform));

        if (false === osMatch) {
          break;
        }

        let cmd;

        switch (option.type) {
          case "text":
            bot.say(id, option.reply, type, msg.uid);
            break;
          case "image": {
            const image = absPath(option.reply, global.configdefdir);
            const imageCQ = `[CQ:image,type=image,file=base64://${base64(image)}]`;

            bot.say(id, imageCQ, type, msg.uid);
            break;
          }
          case "executable":
            cmd = absPath(option.reply, global.configdefdir);
            break;
          case "command":
            cmd = option.reply;
            break;
        }

        if ("string" === typeof cmd) {
          const encoding = os.type().includes("Windows") ? "cp936" : "utf8";
          const command = iconvConvert(cmd, encoding, "utf8");
          const options = { encoding: "binary", env: { USER_ID: msg.uid, USER_NAME: msg.name, MSG_TEXT: msg.text } };

          exec(command, options, (err, stdout, stderr) => {
            bot.say(id, iconvConvert(null === err ? stdout : stderr, encoding), type, msg.uid);
          });
        }

        break;
      }
    }
  }

  function doPlugin(msg) {
    const regexPool = { ...global.command.regex, ...global.master.regex };
    const enableList = { ...global.command.enable, ...global.master.enable };

    for (const regex in regexPool) {
      const r = new RegExp(regex, "mi");
      const plugin = regexPool[regex];

      if (enableList[plugin] && r.test(msg.raw_message)) {
        // 只允许管理者执行主人命令
        if (global.master.enable[plugin] && !global.config.masters.includes(msg.uid)) {
          bot.say(msg.sid, "不能使用管理命令。", type, msg.uid);
          return true;
        }

        if ("group" === type && isGroupBan(msg, type, bot)) {
          return true;
        }

        if (global.config.requestInterval < msg.time - (mTimestamp[msg.uid] || (mTimestamp[msg.uid] = 0))) {
          mTimestamp[msg.uid] = msg.time;
          // 参数 bot 为了兼容可能存在的旧插件
          plugins[plugin].run(msg, bot);
          return true;
        }
      }
    }

    return false;
  }

  if (undefined === type) {
    return false;
  }

  const groupOfStranger = await getGroupOfStranger(bot, msg.user_id);

  if ("private" === type && 1 !== global.config.replyStranger && undefined !== groupOfStranger) {
    return false;
  }

  // 处理 @ 机器人
  // [CQ:at,type=at,qq=123456789,text=@昵称]
  const atMeReg = new RegExp(`^\\s*\\[CQ:at,type=.*?,qq=${bot.uin},text=.+?]\\s*`, "m");
  const atMe = !!lodash.chain(msg.message).filter({ type: "at" }).find({ qq: bot.uin }).value();

  if (atMe) {
    switch (global.config.atMe) {
      case 0:
        return false;
      case 1:
      // fall through
      case 2:
        if (!atMe) {
          return false;
        }
    }

    msg.raw_message = msg.raw_message.replace(atMeReg, "");
  }

  let match = false;
  let thisPrefix = null;

  // 匹配命令前缀
  if (0 === global.config.prefixes.length || global.config.prefixes.includes(null)) {
    match = true;
  } else {
    for (const prefix of global.config.prefixes) {
      if (msg.raw_message.startsWith(prefix)) {
        match = true;
        thisPrefix = prefix;
        break;
      }
    }
  }

  if (true === match) {
    msg.raw_message = msg.raw_message.slice(thisPrefix ? thisPrefix.length : 0).trimStart();
  } else {
    return false;
  }

  // 同步 oicq 数据结构
  if (lodash.hasIn(msg.message, "[0].text")) {
    msg.message = lodash.chain(msg.message).filter({ type: "text" }).slice(0, 1).value();
    msg.message[0].text = msg.raw_message;
  }

  // 添加自定义属性
  msg.bot = bot;
  msg.text = msg.raw_message;
  msg.type = type;
  msg.uid = msg.user_id;
  msg.gid = msg.group_id;
  msg.sid = "group" === msg.type ? msg.gid : msg.uid;
  msg.name = msg.sender.nickname;
  msg.atMe = atMe;
  msg.groupOfStranger = groupOfStranger;

  // 不响应消息则当做一条已经指派插件的命令返回
  if (!checkAuth(msg, global.innerAuthName.reply, false)) {
    return true;
  }

  doQa(msg);

  return doPlugin(msg);
}

function doNoticeFriendIncrease(msg, bot) {
  if (global.config.friendGreetingNew) {
    // 私聊不需要 @
    bot.say(msg.user_id, global.greeting.new, "private");
  }
}

function doNoticeGroupIncrease(msg, bot) {
  if (bot.uin === msg.user_id) {
    // 如果加入了新群，尝试向全群问好
    // 群通知不需要 @
    bot.say(msg.group_id, global.greeting.hello, "group");
  } else {
    // 如果有新群友，尝试向新群友问好
    if (global.config.groupGreetingNew && checkAuth({ uid: msg.group_id }, global.innerAuthName.reply, false)) {
      bot.say(msg.group_id, global.greeting.new, "group", msg.user_id);
    }
  }
}

function doMessageGroup(msg, bot) {
  if (global.config.repeatProb > 0 && getRandomInt(100 * 100) < global.config.repeatProb + 1) {
    // 复读群消息不需要 @
    bot.say(msg.group_id, msg.raw_message, "group");
  }
}

function doSystemOnline(bot) {
  // 通知管理者
  bot.sayMaster(undefined, "我上线了。");

  // 尝试通知群
  if (1 === global.config.groupHello) {
    bot.gl.forEach((group) => {
      const greeting = checkAuth({ sid: group.group_id }, global.innerAuthName.reply, false)
        ? global.greeting.online
        : global.greeting.die;

      if ("string" === typeof greeting) {
        // 群通知不需要 @
        bot.say(group.group_id, greeting, "group");
      }
    });
  }
}

async function dispatch(msg, plugins, event, bot) {
  const types = { "message.private": "private", "message.group": "group" };

  if (undefined !== msg.raw_message && Array.isArray(msg.message)) {
    msg.raw_message = toCqcode(msg);
  }

  // 如果信息是命令，尝试指派插件处理命令
  if (Object.keys(types).includes(event) && msg.message.find((c) => "text" === c.type)) {
    if (await doPossibleCommand(msg, plugins, types[event], bot)) {
      return;
    }
  }

  // 如果信息不是命令
  switch (event) {
    // 好友增加，尝试向新朋友问好
    case "notice.friend.increase":
      doNoticeFriendIncrease(msg, bot);
      break;
    // 新成员入群，尝试向新成员或者全群问好
    case "notice.group.increase":
      doNoticeGroupIncrease(msg, bot);
      break;
    // 随机复读群消息
    case "message.group":
      doMessageGroup(msg, bot);
      break;
    // 发送上线通知
    case "system.online":
      doSystemOnline(bot);
      break;
  }
}

export { dispatch };
