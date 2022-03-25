import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import "#utils/config";
import db from "#utils/database";
import { ls } from "#utils/file";

const mDatabaseNames = ls(path.resolve(global.rootdir, "data", "db"))
  .filter((c) => c.match(/\b\w+?[.]json$/))
  .map((c) => {
    const p = path.parse(c);
    return p.name;
  });

(async function main() {
  const { argv } = yargs(hideBin(process.argv))
    .usage("-d <string> -k <string> [-p <string> --pk <string> --pv <string> --numeric")
    .example("-d gacha -k user")
    .example("-d gacha -k data --pk gacha_type --pv 200 --numeric")
    .example("-d gacha -k data -p '[0].nonUpFiveStar' --pk item_name --pv 刻晴")
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
        description: "数据库的字段",
        requiresArg: true,
        required: false,
      },
      path: {
        alias: "p",
        type: "string",
        description: "字段中的路径",
        requiresArg: false,
        required: false,
      },
      "predicate-key": {
        alias: "pk",
        type: "string",
        description: "断言中的键",
        requiresArg: false,
        required: false,
      },
      "predicate-value": {
        alias: "pv",
        type: "string",
        description: "断言中的值",
        requiresArg: false,
        required: false,
      },
      "predicate-value-numeric": {
        alias: "numeric",
        type: "boolean",
        description: "如果 predicate-value 是数字则指定此项",
        requiresArg: false,
        required: false,
      },
      list: {
        alias: "l",
        type: "boolean",
        description: "显示可用数据库名称",
        requiresArg: false,
        required: false,
      },
    });

  if ("string" === typeof argv.key) {
    if (!mDatabaseNames.includes(argv.database)) {
      console.error(`错误：未知的数据库 ${argv.database} ，使用 -l 查看可用数据库。`);
      return -1;
    }

    db.init(argv.database);

    const data = db.get(
      ...[
        argv.database,
        argv.key,
        argv.path,
        "string" === typeof argv.pk && "string" === typeof argv.pv
          ? { [argv.pk]: true === argv["predicate-value-numeric"] ? parseInt(argv.pv) : argv.pv }
          : undefined,
      ].filter((c) => undefined !== c)
    );

    console.log(JSON.stringify(data, null, 2));

    return 0;
  }

  if (true === argv.list) {
    if (mDatabaseNames.length > 0) {
      console.log(mDatabaseNames.join("\n"));
      return 0;
    }

    return -1;
  }

  return 0;
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
