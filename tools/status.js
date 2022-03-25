import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { status } from "#plugins/tools_master/status";
import "#utils/config";

(async function main() {
  const { argv } = yargs(hideBin(process.argv))
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
    });

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const ret = await status();
  let text = ret.text;

  if (true === argv.json) {
    text = JSON.stringify(ret.data || {}, null, 2);
  }

  console.log(text);
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
