import fs from "fs";
import url from "url";
import path from "path";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ls(dir, buffer) {
  buffer = buffer || [];

  if (!fs.existsSync(dir)) {
    return [];
  }

  if (!path.isAbsolute(dir)) {
    dir = path.resolve(__dirname, dir);
  }

  let files = fs.readdirSync(dir);

  files.forEach((file) => {
    if (fs.statSync(path.resolve(dir, file)).isDirectory()) {
      buffer = ls(path.resolve(dir, file), buffer);
    } else {
      buffer.push(path.resolve(dir, file));
    }
  });

  return buffer;
}

function du(dir) {
  const files = ls(dir);
  let size = 0;

  files.forEach((file) => {
    size += fs.statSync(file).size;
  });

  return size;
}

export { ls, du };
