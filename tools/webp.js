import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { toWebpFile } from "#utils/sharp";

("use strict");

(async function main() {
  const { argv } = yargs(hideBin(process.argv))
    .usage("-f <string>")
    .example("-f ./resources/character/gacha/刻晴.png")
    .help("help")
    .alias("help", "h")
    .version(false)
    .options({
      filelist: {
        alias: "f",
        type: "array",
        description: "图片文件路径列表",
        requiresArg: true,
        required: true,
      },
      lossless: {
        alias: "l",
        type: "boolean",
        default: false,
        description: "无损",
        requiresArg: false,
        required: false,
      },
    });

  const { filelist } = argv;

  for (const f of filelist.filter((c) => "" !== c)) {
    if (!fs.existsSync(f)) {
      console.error(`警告：文件 ${f} 不存在。`);
      continue;
    }

    const pathInfo = path.parse(f);
    const output = path.resolve(pathInfo.dir, `${pathInfo.name}.webp`);
    const data = fs.readFileSync(f);

    process.stdout.write(`转换 ${output} ... `);

    try {
      await toWebpFile(data, output, argv.lossless);
      console.log("成功");
    } catch (e) {
      console.log("失败");
    }
  }

  return 0;
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
