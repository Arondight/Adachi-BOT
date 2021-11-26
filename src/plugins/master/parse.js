function parse(text, func) {
  const id = parseInt(text.match(/[0-9]+/g)[0]);
  const isOn = text.includes(global.all.functions.options[func].on);
  return [id, isOn];
}

export { parse };
