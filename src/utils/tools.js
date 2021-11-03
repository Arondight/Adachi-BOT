import lodash from "lodash";

function randomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

function guessPossibleNames(name, names) {
  if (!Array.isArray(names) || names.includes(name)) {
    return undefined;
  }

  let words = [];
  let keys = lodash.concat([], name.match(/\b(\w|\d)+?\b/g));
  name = name.replace(/(\w|\d|\s)/g, "") || [];
  keys = lodash.concat(keys, [...name]);

  for (const n of [...keys]) {
    words = lodash
      .chain(names)
      .filter((c) => c.includes(n))
      .concat(words)
      .uniq()
      .value();
  }

  return words.join("、");
}

export { randomString, getRandomInt, guessPossibleNames };
