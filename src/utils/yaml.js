import fs from "fs";
import yaml from "js-yaml";
import path from "path";

function loadYML(name) {
  const filename = `${name}.yml`;
  let filepath = path.resolve(global.configdir, filename);

  try {
    fs.accessSync(filepath, fs.constants.R_OK);
  } catch (e) {
    filepath = path.resolve(global.configdefdir, filename);
  }

  return yaml.load(fs.readFileSync(filepath, "utf-8"));
}

export { loadYML };
