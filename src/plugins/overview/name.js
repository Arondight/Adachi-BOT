import { filterWordsByRegex } from "#utils/tools";

function getName(text) {
  const name = filterWordsByRegex(text, ...global.command.functions.entrance.info);
  return "string" === typeof name ? name.toLowerCase() : "";
}

export { getName };
