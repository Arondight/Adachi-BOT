import fs from "fs";
import path from "path";
import url from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ls } from "../src/utils/file.js";
import { render } from "../src/utils/render.js";

global.rootdir = undefined;
global.config = { viewDebug: 1 };

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const paramsDir = path.resolve(__dirname, "..", "data", "record", "last_params");
const names = Object.fromEntries(
  ls(paramsDir)
    .filter((c) => c.match(/\bgenshin-\w+?[.]json$/))
    .map((c) => {
      const p = path.parse(c);
      return [p.name.split("-").slice(-1)[0], p.name];
    })
);

async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage("-n <string>")
    .example("-n aby")
    .help("help")
    .alias("help", "h")
    .version(false)
    .options({
      name: {
        alias: "n",
        type: "string",
        description: "视图名称",
        requiresArg: true,
        required: false,
      },
      list: {
        alias: "l",
        type: "boolean",
        description: "显示可选视图名称",
        requiresArg: false,
        required: false,
      },
    }).argv;

  if ("string" === typeof argv.name) {
    if (undefined !== names[argv.name]) {
      const view = `genshin-${argv.name}`;
      const dataFile = path.resolve(paramsDir, `${view}.json`);
      const viewFile = path.resolve(__dirname, "..", "src", "views", `${view}.html`);

      for (const f of [dataFile, viewFile]) {
        try {
          fs.accessSync(f, fs.constants.R_OK);
        } catch (e) {
          console.error(`错误：无法读取文件 ${f} 。`);
          return -1;
        }
      }

      const data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));

      if (data) {
        render({}, data, view);
        await new Promise(() => {}); // active but do nothing, never return
      }
    }

    console.error(`错误：未知的名称 ${argv.name} ，使用 -l 查看可用名称。`);
    return -1;
  }

  if (true === argv.list) {
    const nameList = Object.keys(names);

    if (nameList.length > 0) {
      console.log(nameList.join("\n"));
      return 0;
    }

    return -1;
  }
}

main().then((n) => process.exit(n));
