/* ========================================================================== *
 * 文件的原始版本来源于 merge-deep 。
 * https://github.com/jonschlinkert/merge-deep/blob/11e5dd5/index.js
 * ========================================================================== */

import kindOf from "kind-of";
import lodash from "lodash";

function isObject(o) {
  return "object" === kindOf(o) || "function" === kindOf(o);
}

function isValidKey(k) {
  return "__proto__" !== k && "constructor" !== k && "prototype" !== k;
}

function hasOwn(o, k) {
  return Object.prototype.hasOwnProperty.call(o, k);
}

function doMerge(o1, o2) {
  for (const k in o2) {
    if (isValidKey(k) && hasOwn(o2, k)) {
      o1[k] = isObject(o1[k]) && isObject(o2[k]) ? doMerge(o1[k], o2[k]) : lodash.cloneDeep(o2[k]);
    }
  }

  return o1;
}

function merge(obj, ...rest) {
  const t = lodash.cloneDeep(isObject(obj) || Array.isArray(obj) ? obj : {});

  for (const o of rest) {
    if (isObject(o) || Array.isArray(o)) {
      doMerge(t, o);
    }
  }

  return t;
}

export { merge };
