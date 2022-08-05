import { once } from "events";
import fs from "fs";
import md5 from "md5";
import path from "path";
import fetch from "sync-fetch";
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
      response = fetch(url, { method: "HEAD" });

      return !(200 !== response.status || du(filepath) !== parseInt(response.headers.get("Content-length")));
    } catch (e) {
      return false;
    }
  }

  return false;
}

async function doCache(url, dir) {
  const filepath = getCachedPath(url, dir);

  if (!(await isCached(url, dir))) {
    try {
      const stream = fs.createWriteStream(filepath);
      const writeFilePromise = util.promisify(fs.writeFile);
      const response = fetch(url);
      const buffer = response.arrayBuffer();

      writeFilePromise(filepath, Buffer.from(buffer))
        .then(() => stream.end())
        .catch((e) => global.bots.logger.error(`错误：写入 ${filepath} 失败，因为“${e}”。`));
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
  let context;

  if ("string" === typeof filepath && "" !== filepath) {
    try {
      context = fs.readFileSync(filepath, { encoding });
    } catch (e) {
      // do nothing
    }
  }

  return context;
}

export { getCache };
