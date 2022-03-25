import express from "express";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import "#utils/config";

const m_DEFAULT_PORT = 9934;

(function main() {
  const { argv } = yargs(hideBin(process.argv))
    .help("help")
    .alias("help", "h")
    .version(false)
    .options({
      port: {
        alias: "p",
        type: "number",
        description: "端口",
        requiresArg: true,
        required: false,
      },
    });
  const port = argv.port || m_DEFAULT_PORT;
  const server = express(port);

  server.use(express.static(global.rootdir));
  server.listen(port, "localhost");
})();
