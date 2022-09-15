import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { toWebpFile, webpOpt, webpPos } from "#utils/sharp";

("use strict");

(async function main() {
  const { argv } = yargs(hideBin(process.argv))
    .usage("-f <string> -w <number> -h <number>")
    .example("-f ./resources/character/gacha/刻晴.webp -w 320 -h 1024 -c -p bottom")
    .help("help")
    .version(false)
    .options({
      file: {
        alias: "f",
        type: "string",
        description: "图片文件路径",
        requiresArg: true,
        required: true,
      },
      output: {
        alias: "o",
        type: "string",
        description: "输出文件路径（不指定则覆盖图片文件）",
        requiresArg: true,
        required: false,
      },
      lossless: {
        alias: "l",
        type: "boolean",
        default: false,
        description: "无损",
        requiresArg: false,
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
        description: "进行裁剪或填充而非缩放",
        requiresArg: false,
        required: false,
      },
      position: {
        alias: "p",
        type: "string",
        choices: ["center", "top", "left", "bottom", "right", "top_left", "top_right", "bottom_left", "bottom_right"],
        default: "center",
        description: "此选项为裁剪和填充的基准位置",
        requiresArg: true,
        required: false,
      },
      preserving: {
        alias: "P",
        type: "boolean",
        description: "保持比例",
        requiresArg: false,
        required: false,
      },
    })
    .conflicts("crop", "preserving");

  const webpPosOfReadable = {
    center: webpPos.CENTER,
    top: webpPos.TOP,
    left: webpPos.LEFT,
    bottom: webpPos.BOTTOM,
    right: webpPos.RIGHT,
    top_left: webpPos.TOP | webpPos.LEFT,
    top_right: webpPos.TOP | webpPos.RIGHT,
    bottom_left: webpPos.BOTTOM | webpPos.LEFT,
    bottom_right: webpPos.BOTTOM | webpPos.RIGHT,
  };
  const { file, crop, position, preserving } = argv;
  const resize = true === crop ? webpOpt.CROP : webpOpt.RESIZE;

  if (!fs.existsSync(file)) {
    console.error(`错误：文件 ${file} 不存在。`);
    return -1;
  }

  const output = argv.output || file;
  const data = fs.readFileSync(file);

  process.stdout.write(`转换 ${file} ... `);

  try {
    await toWebpFile(
      data,
      output,
      argv.lossless,
      { resize, size: argv.width },
      { resize, size: argv.height },
      webpPosOfReadable[position],
      preserving
    );
    console.log("成功");
  } catch (e) {
    console.log("失败");
  }

  return 0;
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
