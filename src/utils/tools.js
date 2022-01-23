import lodash from "lodash";
import fnv from "fnv-plus";
import levenshtein from "fastest-levenshtein";

const similarityMaxValue = 0.5;

// -1   not a start bracket
// -2   not found end bracket
// -3   invalid text
// -4   invalid index
// -5   invalid brackets
// > 0  index of end bracket
function matchBracket(text, index, brackets = ["[", "]"]) {
  let stackSize = 0;

  if ("string" !== typeof text || text.length <= 2) {
    return -3;
  }

  if (0 > index || index > text.length - 1) {
    return -4;
  }

  if (false === Array.isArray(brackets) || 2 !== brackets.length) {
    return -5;
  }

  for (const bracket of brackets) {
    if ("string" !== typeof bracket || 1 !== bracket.length) {
      return -5;
    }
  }

  const start = text[index];

  if (start !== brackets[0]) {
    return -1;
  }

  for (let i = index; i < text.length; ++i) {
    if (brackets[0] === text[i]) {
      ++stackSize;
    }

    if (brackets[1] === text[i]) {
      --stackSize;
    }

    if (0 === stackSize) {
      return i;
    }
  }

  return -2;
}

function randomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function getRandomInt(boundary) {
  return Math.floor(Math.random() * boundary);
}

// return [match, new, origin]
function getWordByRegex(text, regstr) {
  let r = regstr;
  let w;

  if ("string" === typeof r) {
    r = new RegExp(r, "i");
  }

  if (r instanceof RegExp && (w = r.exec(text))) {
    return [w[0], text.replace(r, "").trim(), text];
  }

  return [undefined, undefined, text];
}

function filterWordsByRegex(text, ...rest) {
  for (const r of rest) {
    const unmatch = getWordByRegex(text, r)[1];

    if ("string" === typeof unmatch) {
      text = unmatch;
    }
  }

  return text;
}

// 英文数字空格分割，中文按字分割
function segment(text) {
  const regex = /\b(\w|\d)+?\b/g;
  return lodash.concat([], text.match(regex), [...(text.replace(regex, "").replace(/\s/g, "") || [])]);
}

function simhash(text) {
  const seg = segment(text);
  const km = new Map();
  const hm = new Map();
  let result = "";

  seg.map((k) => km.set(k, km.has(k) ? km.get(k) + 1 : 1));
  km.forEach((v, k) => {
    const hash64 = fnv.hash(k, 64);
    const h = parseInt("0x" + hash64.hex())
      .toString(2)
      .padStart(64, "0");

    for (let i = 0; i < h.length; i++) {
      const v1 = parseInt(h[i]);
      const v2 = v * (v1 > 0 ? 1 : -1);
      hm.set(i, hm.has(i) ? hm.get(i) + v2 : v2);
    }
  });

  for (let i = 0; i < 64; i++) {
    hm.set(i, hm.get(i) > 0 ? 1 : 0);
    result = result + hm.get(i);
  }

  return result;
}

function hamming(h1, h2) {
  let d = 0;

  for (let i = 0; i < Math.min(h1.length, h2.length); i++) {
    if (h1[i] !== h2[i]) {
      d++;
    }
  }

  return d;
}

function similarity(s1, s2) {
  return "string" === typeof s1 && "string" === typeof s2
    ? levenshtein.distance(s1, s2) / Math.max(s1.length, s2.length)
    : Number.MAX_SAFE_INTEGER;
}

function isPossibleName(name, names) {
  if ("string" === typeof name) {
    const s1 = name;

    for (const s2 of names) {
      if ("string" === typeof s2 && similarity(s1, s2) <= similarityMaxValue) {
        return true;
      }
    }
  }

  return false;
}

function guessPossibleNames(name, names) {
  let words = [];

  if ("string" === typeof name && names.length > 0) {
    let bestMatch = false;
    const sorted = lodash
      .chain(names)
      .reduce((p, v) => {
        if (false === bestMatch) {
          const l = name.length / v.length;
          let best = Number.MAX_SAFE_INTEGER;
          let n;

          // 使用前后包含子串确定相似度
          // 0.3 六个字里面对两个
          if ((v.startsWith(name) || v.endsWith(name)) && l >= 0.3) {
            n = (1 - l) / 2;
            best = n;
          }

          // 使用编辑距离计算相似度
          n = similarity(name, v);
          best = n < best ? n : best;

          // 使用最佳相似度判断是否相似
          if (best <= similarityMaxValue) {
            p[v] = best;
            bestMatch = 0 === best;
          }
        }
        return p;
      }, {})
      .toPairs()
      .sortBy(1)
      .value();

    if (sorted.length > 0 && 1 === lodash.filter(sorted, (c) => c[1] === sorted[0][1]).length) {
      words = [global.names.allAlias[sorted[0][0]] || sorted[0][0]];
    } else {
      words = lodash
        .chain(sorted)
        .fromPairs()
        .keys()
        .map((c) => global.names.allAlias[c] || c)
        .uniq()
        .value();
    }
  }

  return words;
}

export {
  filterWordsByRegex,
  getRandomInt,
  getWordByRegex,
  guessPossibleNames,
  hamming,
  isPossibleName,
  matchBracket,
  randomString,
  segment,
  simhash,
  similarity,
  similarityMaxValue,
};
