import path from "path";
import url from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { status } from "#plugins/tools_master/status";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.rootdir = path.resolve(__dirname, "..");

async function main() {
  const argv = yargs(hideBin(process.argv))
    .help("help")
    .alias("help", "h")
    .version(false)
    .options({
      json: {
        alias: "j",
        type: "boolean",
        description: "格式化输出",
        requiresArg: false,
        required: false,
      },
    }).argv;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const ret = await status();
  let text = ret.text;

  if (true === argv.json) {
    text = JSON.stringify(ret.data || {}, null, 2);
  }

  console.log(text);
}

main().then((n) => process.exit(n));
