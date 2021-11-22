/* global command */
/* eslint no-undef: "error" */

import { filterWordsByRegex } from "../../utils/tools.js";

function getName(text) {
  const name = filterWordsByRegex(text, ...command.functions.entrance.info);
  return "string" === typeof name ? name.toLowerCase() : "";
}

export { getName };
