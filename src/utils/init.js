import schedule from "node-schedule";
import express from "express";
import db from "./database.js";
import { renderClose } from "./render.js";
import { gachaUpdate as updateGachaJob } from "./update.js";

let postRunning = false;

function initDB() {
  db.init("aby");
  db.init("artifact");
  db.init("authority");
  db.init("character", { record: [] });
  db.init("cookies", { cookie: [], uid: [] });
  db.init("cookies_invalid", { cookie: [] });
  db.init("gacha", { user: [], data: [] });
  db.init("info");
  db.init("map");
  db.init("music", { source: [] });
  db.init("time");
}

function cleanDB(name) {
  let nums = db.clean(name);
  global.bots.logger.debug(`清理：删除数据库 ${name} 中 ${nums} 条无用记录。`);
  return nums;
}

async function lastWords() {
  for (const bot of global.bots) {
    await bot.sayMaster(undefined, "我下线了。");
  }
}

function cleanDBJob() {
  let nums = 0;
  nums += cleanDB("aby");
  nums += cleanDB("cookies");
  nums += cleanDB("cookies_invalid");
  nums += cleanDB("info");
  return nums;
}

function syncDBJob() {
  db.names().forEach((n) => {
    db.sync(n);
    global.bots.logger.debug(`同步：将数据库 ${n} 缓存写入到磁盘。`);
  });
}

async function doPost() {
  if (false === postRunning) {
    postRunning = true;
    await renderClose();
    await lastWords();
    syncDBJob();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    postRunning = false;
  } else {
    while (true === postRunning) {
      await new Promise((resolve) => setTimeout(() => resolve(), 100));
    }
  }
}

function serve(port = 9934) {
  const server = express();
  server.use(express.static(global.rootdir));
  server.listen(port, "localhost");
}

async function init() {
  serve(9934);
  initDB();
  updateGachaJob();
  cleanDBJob();

  for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"]) {
    process.on(signal, () => doPost().then((n) => process.exit(n)));
  }

  schedule.scheduleJob("1 */1 * * *", async () => updateGachaJob());
  schedule.scheduleJob("1 */1 * * *", async () => cleanDBJob());
  schedule.scheduleJob("*/5 * * * *", async () => syncDBJob());
}

export { init };
