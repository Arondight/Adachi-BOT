import { once } from "events";
import fs from "fs";
import md5 from "md5";
import fetch from "node-fetch";
import path from "path";
import util from "util";
import { du, mkdir } from "#utils/file";

function getCachedPath(url, dir) {
  const workdir = dir || path.resolve(global.datadir, "cache");
  return url && path.resolve(mkdir(workdir), md5(url));
}

async function isCached(url, dir) {
  const filepath = getCachedPath(url, dir);
  let response;

  if (fs.existsSync(filepath)) {
    try {
      response = await fetch(url, { method: "HEAD" });
    } catch (e) {
      return false;
    }

    return !(200 !== response.status || du(filepath) !== parseInt(response.headers.get("Content-length")));
  }

  return false;
}

async function doCache(url, dir) {
  const filepath = getCachedPath(url, dir);

  if (!(await isCached(url, dir))) {
    try {
      const stream = fs.createWriteStream(filepath);
      const writeFilePromise = util.promisify(fs.writeFile);

      await fetch(url)
        .then((r) => r.arrayBuffer())
        .then((r) => writeFilePromise(filepath, Buffer.from(r)))
        .then(() => stream.end());
      await once(stream, "finish");
    } catch (e) {
      global.bots.logger.error(`错误：拉取 ${url} 失败，因为“${e}”。`);
      return undefined;
    }
  }

  return fs.existsSync(filepath) ? filepath : undefined;
}

async function getCache(url, dir, encoding = null) {
  const filepath = await doCache(url, dir);
  return filepath ? fs.readFileSync(filepath, { encoding }) : undefined;
}

export { getCache };
