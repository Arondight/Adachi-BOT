import express from "express";
import schedule from "node-schedule";
import db from "#utils/database";
import { mysNewsNotice } from "#utils/notice";
import { renderClose, renderOpen, renderPath } from "#utils/render";
import { gachaUpdate, mysNewsUpdate } from "#utils/update";

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
  db.init("news", { data: {}, timestamp: [] });
  db.init("time");
}

async function initBrowser() {
  global.bots.logger.debug(`正在从 ${renderPath} 拉起浏览器实例。`);
  await renderOpen();
}

function doDBClean(name) {
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
  nums += doDBClean("aby");
  nums += doDBClean("cookies");
  nums += doDBClean("cookies_invalid");
  nums += doDBClean("info");
  return nums;
}

function syncDBJob() {
  db.names().forEach((n) => {
    db.sync(n);
    global.bots.logger.debug(`同步：将数据库 ${n} 缓存写入到磁盘。`);
  });
}

async function mysNewsJob() {
  if (true === (await mysNewsUpdate())) {
    mysNewsNotice();
  }
}

async function updateGachaJob() {
  if (true === (await gachaUpdate())) {
    global.bots.logger.debug("卡池：内容已刷新。");
  } else {
    global.bots.logger.debug("卡池：刷新内容失败。");
  }
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
  for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"]) {
    process.on(signal, () => doPost().then((n) => process.exit(n)));
  }

  serve(9934);
  initDB();
  await initBrowser();
  await updateGachaJob();
  cleanDBJob();
  syncDBJob();

  schedule.scheduleJob("*/5 * * * *", () => syncDBJob());
  schedule.scheduleJob("*/5 * * * *", () => mysNewsJob());
  schedule.scheduleJob("1 */1 * * *", () => cleanDBJob());
  schedule.scheduleJob("0 */1 * * *", () => updateGachaJob());
}

export { init };
