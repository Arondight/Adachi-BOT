import { filterWordsByRegex, getWordByRegex } from "#utils/tools";

("use strict");

function getText(msg) {
  return getWordByRegex(filterWordsByRegex(msg.text, ...global.command.functions.entrance.artifacts), /\S+/)[0];
}

export { getText };
