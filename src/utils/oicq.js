/* ========================================================================== *
 * 文件的原始版本来源于 oicq 。
 * https://github.com/takayama-lily/oicq
 * ==========================================================================
 * 因为 oicq 维护的这几个 API 有兼容性问题，所以在此重新实现。另外添加了一些自己的封装。
 * ========================================================================== */

import lodash from "lodash";
import querystring from "querystring";
import { genDmMessageId } from "oicq/lib/message/message.js";

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
      .substr(i + 1)
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
  const isQuote = lodash.hasIn(msg, ["source", "message"]);
  let cqcode = "";
  let firstAtParsed = false;

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

    if ("at" === c.type && false === firstAtParsed && true === isQuote) {
      cqcode += cq;
      firstAtParsed = true;
    }
  });

  return cqcode;
}

function fromCqcode(text = "") {
  const elems = [];
  const iter = text.matchAll(/\[CQ:[^\]]+\]/g);
  let index = 0;

  for (const c of iter) {
    const s = text.slice(index, c.index).replace(new RegExp(Object.keys(CQ).join("|"), "g"), (s) => CQ[s] || "");

    if ("string" === typeof s && "" !== s) {
      elems.push({ type: "text", text: s });
    }

    let cq = c[0].replace("[CQ:", "type=");
    cq = cq.substr(0, cq.length - 1);
    elems.push(qs(cq));
    index = c.index + c[0].length;
  }

  if (index < text.length) {
    const s = text.slice(index).replace(new RegExp(Object.keys(CQ).join("|"), "g"), (s) => CQ[s] || "");

    if ("string" === typeof s) {
      elems.push({ type: "text", text: s });
    }
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

async function say(
  bot,
  id,
  msg,
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

          if (true === isGroupBan({ group_id: ginfo.group_id, group_name: ginfo.group_name }, type, bot)) {
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
          let isFriend = false;

          for (const [, f] of bot.fl) {
            if (id === f.user_id) {
              isFriend = true;
              break;
            }
          }

          if (true === isFriend) {
            bot.sendPrivateMsg(id, fromCqcode(msg));
            return;
          }

          let gid;

          for (const [, g] of bot.gl) {
            const members = await bot.getGroupMemberList(g.group_id);
            let find = false;

            for (const [, m] of members) {
              if (id === m.user_id) {
                gid = g.group_id;
                find = true;
                break;
              }
            }

            if (true === find) {
              break;
            }
          }

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

async function sayMaster(bot, id, msg, type = undefined, user = undefined) {
  if (Array.isArray(global.config.masters) && global.config.masters.length) {
    global.config.masters.forEach((master) => master && say(bot, master, msg, "private"));
  } else {
    if (undefined !== id && "string" === typeof type && undefined !== user) {
      say(bot, id, "未设置我的主人。", type, user);
    }
  }
}

export { fromCqcode, isGroupBan, say, sayMaster, toCqcode };
