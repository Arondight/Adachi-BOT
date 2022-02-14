import { filterWordsByRegex, getWordByRegex } from "#utils/tools";

function getName(text) {
  let character = filterWordsByRegex(
    text,
    ...[...global.command.functions.entrance.character, ...global.command.functions.entrance.others_character]
  );

  if (character.startsWith("的")) {
    const match = getWordByRegex(character, /的/);
    character = getWordByRegex(match[1] || match[2], /\S+/)[0];
  }

  if (!character) {
    return undefined;
  }

  character = "string" === typeof character ? character.toLowerCase() : "";
  character = global.names.characterAlias[character] || character;

  return character;
}

export { getName };
