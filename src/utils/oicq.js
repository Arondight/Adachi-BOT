/* ========================================================================== *
 * 因为 oicq 维护的兼容 API 有问题，所以在此重新实现。另外添加了一些自己的封装。
 * ========================================================================== */
import lodash from "lodash";
import querystring from "querystring";
import { genDmMessageId } from "oicq/lib/message/message.js";
import { matchBracket } from "#utils/tools";

const CQ = {
  "&#91;": "[",
  "&#93;": "]",
  "&amp;": "&",
};
const CQInside = {
  "&": "&amp;",
  ",": "&#44;",
  "[": "&#91;",
  "]": "&#93;",
};

function qs(text, sep = ",", equal = "=") {
  const ret = {};

  text.split(sep).forEach((c) => {
    const i = c.indexOf(equal);

    if (-1 === i) {
      return;
    }

    ret[c.substring(0, i)] = c
      .substring(i + 1)
      .replace(new RegExp(Object.values(CQInside).join("|"), "g"), (s) => lodash.invert(CQInside)[s] || "");
  });

  for (const k in ret) {
    try {
      if ("text" !== k) {
        ret[k] = JSON.parse(ret[k]);
      }
    } catch (e) {
      // do nothing
    }
  }

  return ret;
}

// BREAKING 参数已改变
function toCqcode(msg = {}) {
  const isQuote = lodash.hasIn(msg, "source.message");
  let cqcode = "";

  if (true === isQuote) {
    const quote = { ...msg.source, flag: 1 };
    const mid = genDmMessageId(quote.user_id, quote.seq, quote.rand, quote.time, quote.flag);

    cqcode += `[CQ:reply,id=${mid}]`;
  }

  (msg.message || []).forEach((c) => {
    if ("text" === c.type) {
      cqcode += c.text;
      return;
    }

    const s = querystring.stringify(c, ",", "=", {
      encodeURIComponent: (s) => s.replace(new RegExp(Object.keys(CQInside).join("|"), "g"), (s) => CQInside[s] || ""),
    });
    const cq = `[CQ:${c.type}${s ? "," : ""}${s}]`;

    cqcode += cq;
  });

  return cqcode;
}

function fromCqcode(text = "") {
  const elems = [];
  const items = [];
  let itemsSize = 0;

  for (let i = 0; i < text.length; ++i) {
    const brackets = ["[", "]"];
    const pos = matchBracket(text, i, brackets);

    switch (pos) {
      case -1:
        if (undefined === items[itemsSize]) {
          items[itemsSize] = "";
        }

        items[itemsSize] += text[i];
        continue;
      case -2:
        throw `消息 CQ 码不匹配：${text}`;
      case -3:
      case -4:
        items.push(text);
        i = text.length;
        break;
      case -5:
        // This is impossible
        throw `错误的括号匹配：${brackets.join("")}`;
      default:
        if (pos > 0) {
          items.push(text.substring(i, pos + 1));
          i = pos;
          itemsSize = items.length;
        }
    }
  }

  for (const c of items) {
    const s = c.replace(new RegExp(Object.keys(CQ).join("|"), "g"), (s) => CQ[s] || "");
    let cq = c.replace("[CQ:", "type=");

    if ("string" === typeof s && "" !== s && !s.includes("[CQ:")) {
      elems.push({ type: "text", text: s });
      continue;
    }

    cq = cq.substring(0, cq.length - 1);
    elems.push(qs(cq));
  }

  return elems;
}

function isGroupBan(msg = {}, type, bot) {
  if ("group" === type) {
    const { shutup_time_me: time } = bot.pickGroup(msg.group_id).info || {};

    if (undefined !== time && time > 0) {
      const date = new Date(0);
      date.setUTCSeconds(time);
      bot.logger.debug(
        `禁言：因已被组群 ${
          msg.group_name + "（ " + msg.group_id + " ）"
        }禁言拒绝发送消息，${date.toLocaleString()} 禁言结束。`
      );

      return true;
    }
  }
  return false;
}

function isFriend(bot, id) {
  for (const [, f] of bot.fl) {
    if (id === f.user_id) {
      return true;
    }
  }

  return false;
}

function isGroup(bot, id) {
  for (const [, g] of bot.gl) {
    if (id === g.group_id) {
      return true;
    }
  }

  return false;
}

async function isInGroup(bot, group, id) {
  const members = await bot.getGroupMemberList(group);

  for (const [, m] of members) {
    if (id === m.user_id) {
      return true;
    }
  }

  return false;
}

// return number or undefined
async function getGroupOfStranger(bot, id) {
  if (!isFriend(bot, id)) {
    for (const [, g] of bot.gl) {
      if (await isInGroup(bot, g.group_id, id)) {
        return g.group_id;
      }
    }
  }

  return undefined;
}

async function say(
  bot,
  id,
  msg = "",
  type = "private",
  sender = undefined,
  tryDelete = false,
  delimiter = " ",
  atSender = true
) {
  try {
    if (msg && "" !== msg) {
      switch (type) {
        case "group": {
          const ginfo = await bot.getGroupInfo(id);

          if (isGroupBan({ group_id: ginfo.group_id, group_name: ginfo.group_name }, type, bot)) {
            return;
          }

          if (global.config.atUser && sender && atSender) {
            msg = `[CQ:at,type=at,qq=${sender}]${delimiter}${msg}`;
          }

          // XXX 非管理员允许撤回两分钟以内的消息
          const permissionOK =
            global.config.deleteGroupMsgTime < 120
              ? true
              : "admin" === (await bot.getGroupMemberInfo(id, bot.uin)).role;
          const { message_id: mid } = await bot.sendGroupMsg(id, fromCqcode(msg));

          if (true === tryDelete && undefined !== mid && global.config.deleteGroupMsgTime > 0 && permissionOK) {
            setTimeout(bot.deleteMsg.bind(bot), global.config.deleteGroupMsgTime * 1000, mid);
          }
          break;
        }
        case "private": {
          if (isFriend(bot, id)) {
            bot.sendPrivateMsg(id, fromCqcode(msg));
            return;
          }

          if (1 !== global.config.replyStranger) {
            throw `不回复陌生人 ${id} 的消息`;
          }

          // FIXME 传参缺陷，这里只能再次调用 getGroupOfStranger
          // XXX   此处如更改需要确保向前兼容
          const gid = await getGroupOfStranger(bot, id);

          if (undefined === gid) {
            throw `未找到陌生人 ${id} 所在的群组`;
          }

          bot.sendTempMsg(gid, id, fromCqcode(msg));
          break;
        }
      }
    }
  } catch (e) {
    const info = "string" === typeof e.message ? e.message : e;
    bot.logger.error(`错误：消息发送失败，因为“${info}”。`);
  }
}

async function sayMaster(bot, id, msg = "", type = "private", sender) {
  if (Array.isArray(global.config.masters) && global.config.masters.length) {
    global.config.masters.forEach((master) => master && say(bot, master, msg, "private"));
  } else {
    if (undefined !== id && "string" === typeof type && undefined !== sender) {
      say(bot, id, "未设置我的主人。", type, sender);
    }
  }
}

function boardcast(bot, msg = "", type = "group", check = () => true) {
  const isGroup = "group" === type;
  const typestr = isGroup ? "群" : "好友";
  const list = isGroup ? bot.gl : bot.fl;
  const delay = global.config.boardcastDelay || 100;
  let report = "";
  let count = 0;

  list.forEach((c) => {
    if (check(c)) {
      // 广播无法 @
      const send = () => say(bot, isGroup ? c.group_id : c.user_id, msg, type);

      if (delay > 0) {
        setTimeout(send, delay * count++);
      } else {
        send();
      }

      report += `${isGroup ? c.group_name : c.nickname}（${isGroup ? c.group_id : c.user_id}）\n`;
    }
  });

  if ("" === report) {
    sayMaster(bot, undefined, `没有发现需要发送此广播的${typestr}。`);
    return;
  }

  const speed = 1000 / delay;
  const br = "-".repeat(20);
  report +=
    `${br}\n以上${typestr}正在发送以下广播，速度为` +
    (speed < 1 ? `每个${typestr} ${1 / speed} 秒` : ` ${speed} 个${typestr}每秒`) +
    `。\n${br}\n${msg}`;

  sayMaster(bot, undefined, report);

  return delay * count;
}

export {
  boardcast,
  fromCqcode,
  getGroupOfStranger,
  isFriend,
  isGroup,
  isGroupBan,
  isInGroup,
  say,
  sayMaster,
  toCqcode,
};
