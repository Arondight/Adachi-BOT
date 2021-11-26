import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";

function getName(msg) {
  let name = getWordByRegex(filterWordsByRegex(msg.text, ...global.command.functions.entrance.select), /\S+/)[0];
  return global.names.weaponAlias["string" === typeof name ? name.toLowerCase() : name] || name;
}

export { getName };
