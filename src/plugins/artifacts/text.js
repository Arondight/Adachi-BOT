import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";

function getText(msg) {
  return getWordByRegex(filterWordsByRegex(msg.text, ...global.command.functions.entrance.artifacts), /\S+/)[0];
}

export { getText };
