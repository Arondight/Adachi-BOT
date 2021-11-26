import { filterWordsByRegex, getWordByRegex } from "../../utils/tools.js";

function getText(msg, names) {
  return getWordByRegex(filterWordsByRegex(msg.text, ...names), /\S+/)[0];
}

function getName(msg) {
  const name = getText(msg, global.command.functions.entrance.select);
  return global.names.weaponAlias["string" === typeof name ? name.toLowerCase() : name] || name;
}

function getPool(msg) {
  return getText(msg, global.command.functions.entrance.pool);
}

export { getName, getPool };
