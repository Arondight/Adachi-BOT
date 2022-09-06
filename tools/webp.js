import fs from "fs";
import path from "path";
import sharp from "sharp";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

("use strict");

(async function main() {
  const { argv } = yargs(hideBin(process.argv))
    .usage("-f <string> -w <string> -h <string>")
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
        required: false,
      },
    });

  const { filelist } = argv;

  if (!Array.isArray(filelist)) {
    console.error("错误：空图片文件路径列表。");
    return -1;
  }

  for (const f of filelist) {
    if (!fs.existsSync(f)) {
      console.error(`警告：文件 ${f} 不存在。`);
      continue;
    }

    const data = fs.readFileSync(f);
    const image = sharp(Buffer.from(data));
    const pathInfo = path.parse(f);
    const output = path.resolve(pathInfo.dir, `${pathInfo.name}.webp`);

    console.log(`${path.basename(f)} -> ${path.basename(output)}`);
    await image.webp({ lossless: true }).toFile(output);
  }

  return 0;
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
