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
  let words = [];

  if (!Array.isArray(names) || names.includes(name)) {
    return undefined;
  }

  for (const n of [...name]) {
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
