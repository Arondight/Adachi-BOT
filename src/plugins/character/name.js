/* global alias, command */
/* eslint no-undef: "error" */

import { filterWordsByRegex, getWordByRegex, hamming, simhash } from "../../utils/tools.js";

function getName(text) {
  let character = filterWordsByRegex(
    text,
    ...[...command.functions.entrance.character, ...command.functions.entrance.others_character]
  );

  if (character.startsWith("的")) {
    const match = getWordByRegex(character, /的/);
    character = getWordByRegex(match[1] || match[2], /\S+/)[0];
  }

  if (!character) {
    return undefined;
  }

  character = "string" === typeof character ? character.toLowerCase() : "";
  character = alias.character[character] || character;

  return character;
}

function isPossibleName(name) {
  if ("string" === typeof name) {
    const hash = simhash(name);

    for (const h of Object.values(alias.characterNames)) {
      // 此处汉明距离 < 5 则认为双方具有较高的相似性
      if (hamming(h, hash) < 5) {
        return true;
      }
    }
  }

  return false;
}

export { getName, isPossibleName };
