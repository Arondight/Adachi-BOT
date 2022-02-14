import path from "path";
import url from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import db from "#utils/database";
import { ls } from "#utils/file";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.rootdir = path.resolve(__dirname, "..");
const names = ls(path.resolve(global.rootdir, "data", "db"))
  .filter((c) => c.match(/\b\w+?[.]json$/))
  .map((c) => {
    const p = path.parse(c);
    return p.name;
  });

async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage("-d <string> -k <string> [--ik <string> --iv <string> --iv-numeric")
    .example("-d time -k user")
    .example("-d time -k user --ik uid --iv 123456789 --iv-numeric")
    .example("-d cookies -k cookie --ik date --iv '2021/11/16'")
    .help("help")
    .alias("help", "h")
    .version(false)
    .options({
      database: {
        alias: "d",
        type: "string",
        description: "数据库",
        requiresArg: true,
        required: false,
      },
      key: {
        alias: "k",
        type: "string",
        description: "数据库的键",
        requiresArg: true,
        required: false,
      },
      ik: {
        type: "string",
        description: "索引的键",
        requiresArg: false,
        required: false,
      },
      iv: {
        type: "string",
        description: "索引的值",
        requiresArg: false,
        required: false,
      },
      "iv-numeric": {
        type: "boolean",
        description: "如果索引的值是数组则指定此项",
        requiresArg: false,
        required: false,
      },
      list: {
        alias: "l",
        type: "boolean",
        description: "显示可选数据库名称",
        requiresArg: false,
        required: false,
      },
    }).argv;

  if ("string" === typeof argv.key) {
    if (!names.includes(argv.database)) {
      console.error(`错误：未知的数据库 ${argv.database} ，使用 -l 查看可用数据库。`);
      return -1;
    }

    db.init(argv.database);
    const data = db.get(
      argv.database,
      argv.key,
      "string" === typeof argv.ik && "string" === typeof argv.iv
        ? { [argv.ik]: true === argv["iv-numeric"] ? parseInt(argv.iv) : argv.iv }
        : undefined
    );

    console.log(JSON.stringify(data, null, 2));
    return 0;
  }

  if (true === argv.list) {
    if (names.length > 0) {
      console.log(names.join("\n"));
      return 0;
    }

    return -1;
  }
}

main().then((n) => process.exit(n));
