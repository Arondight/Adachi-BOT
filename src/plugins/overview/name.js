import { filterWordsByRegex } from "../../utils/tools.js";

function getName(text) {
  const name = filterWordsByRegex(text, ...global.command.functions.entrance.info);
  return "string" === typeof name ? name.toLowerCase() : "";
}

export { getName };
