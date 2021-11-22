/* global alias, command */
/* eslint no-undef: "error" */

import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";

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

export { getName };
