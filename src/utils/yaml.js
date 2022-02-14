import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadYML(name) {
  const filename = `${name}.yml`;
  let filepath = path.resolve(__dirname, "..", "..", "config", filename);

  try {
    fs.accessSync(filepath, fs.constants.R_OK);
  } catch (e) {
    filepath = path.resolve(__dirname, "..", "..", "config_defaults", filename);
  }

  return yaml.load(fs.readFileSync(filepath, "utf-8"));
}

export { loadYML };
