import fs from "fs";
import sharp from "sharp";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

("use strict");

(async function main() {
  const { argv } = yargs(hideBin(process.argv))
    .usage("-f <string> -w <string> -h <string>")
    .example("-f ./resources/character/gacha/刻晴.webp -w 320 -h 1024 -c")
    .help("help")
    .version(false)
    .options({
      file: {
        alias: "f",
        type: "string",
        description: "图片文件路径",
        requiresArg: true,
        required: false,
      },
      output: {
        alias: "o",
        type: "string",
        description: "输出文件路径（不指定则覆盖图片文件）",
        requiresArg: true,
        required: false,
      },
      width: {
        alias: "w",
        type: "number",
        description: "宽度（像素）",
        requiresArg: true,
        required: false,
      },
      height: {
        alias: "h",
        type: "number",
        description: "高度（像素）",
        requiresArg: true,
        required: false,
      },
      crop: {
        alias: "c",
        type: "boolean",
        description: "如果长或宽小于原图则首先裁剪",
        requiresArg: false,
        required: false,
      },
    });

  const { file, crop } = argv;

  if (!fs.existsSync(file)) {
    console.error(`错误：文件 ${file} 不存在。`);
    return -1;
  }

  const output = argv.output || file;
  const data = fs.readFileSync(file);
  const image = sharp(Buffer.from(data));
  const { width, height } = await image.metadata();
  const widthTo = argv.width || width;
  const heightTo = argv.height || height;

  // 裁剪
  if (true === crop) {
    if (widthTo < width) {
      console.log(`width: ${width} -> ${widthTo}`);
      await image.extract({ left: (width - widthTo) / 2, top: 0, width: widthTo, height });
    }

    if (heightTo < height) {
      console.log(`heigth: ${height} -> ${heightTo}`);
      await image.extract({ left: 0, top: (height - heightTo) / 2, width, height: heightTo });
    }
  }

  // 缩放
  console.log(`size: ${width}x${height} -> ${widthTo}x${heightTo}`);
  await image.resize({ fit: sharp.fit.fill, width: widthTo, height: heightTo });

  // 写入
  await image.toFile(output);

  return 0;
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
