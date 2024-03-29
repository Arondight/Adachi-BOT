import { filterWordsByRegex, getWordByRegex } from "#utils/tools";

("use strict");

function getText(msg, names) {
  return getWordByRegex(filterWordsByRegex(msg.text, ...names), /\S+/)[0];
}

function getName(msg) {
  const name = getText(msg, global.command.functions.entrance.select);

  if ("string" === typeof name && name.length > 0) {
    return global.names.weaponAlias[name.toLowerCase()] || name;
  }

  return undefined;
}

function getPool(msg) {
  return getText(msg, global.command.functions.entrance.pool);
}

export { getName, getPool };
