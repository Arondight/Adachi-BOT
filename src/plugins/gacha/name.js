/* global alias, command */
/* eslint no-undef: "error" */

import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";

function getName(msg) {
  let name = getWordByRegex(filterWordsByRegex(msg.text, ...command.functions.entrance.select), /\S+/)[0];
  return alias.weapon["string" === typeof name ? name.toLowerCase() : name] || name;
}

export { getName };
