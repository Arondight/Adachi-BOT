import express from "express";
import url from "url";
import path from "path";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function newServer(port) {
  const server = express();
  const workdir = path.resolve(__dirname, "..", "..");
  server.use(express.static(workdir));
  server.listen(port, "localhost");
}

export { newServer };
