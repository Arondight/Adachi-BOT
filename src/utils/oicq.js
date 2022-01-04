/* ========================================================================== *
 * 文件的原始版本来源于 oicq 。
 * https://github.com/takayama-lily/oicq
 * ==========================================================================
 * 因为 oicq 维护的这几个 API 有兼容性问题，所以在此重新实现。
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

export { fromCqcode, toCqcode };
