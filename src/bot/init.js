import schedule from "node-schedule";
import { gachaUpdate } from "#jobs/gacha";
import { mysNewsNotice, mysNewsTryToResetDB, mysNewsUpdate } from "#jobs/news";
import db from "#utils/database";
import { renderClose, renderOpen, renderPath } from "#utils/render";

let mPostRunning = false;

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

  mysNewsTryToResetDB();
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
  const message = "我下线了。";

  for (const bot of global.bots) {
    if (1 === global.config.groupHello) {
      await bot.boardcast(global.greeting.offline || message, "group");
    }

    await bot.sayMaster(undefined, message);
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
  if (await mysNewsUpdate()) {
    mysNewsNotice();
  }
}

async function updateGachaJob() {
  if (await gachaUpdate()) {
    global.bots.logger.debug("卡池：内容已刷新。");
  } else {
    global.bots.logger.debug("卡池：刷新内容失败。");
  }
}

async function doPost() {
  if (false === mPostRunning) {
    mPostRunning = true; // {

    global.bots.logger.debug("正在结束……");
    syncDBJob();
    await renderClose();
    await lastWords();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    // }
    mPostRunning = false;
  } else {
    while (true === mPostRunning) {
      await new Promise((resolve) => setTimeout(() => resolve(), 100));
    }
  }
}

async function init() {
  for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"]) {
    process.on(signal, () => doPost().then((n) => process.exit(n)));
  }

  initDB();
  await initBrowser();
  await updateGachaJob();
  cleanDBJob();
  syncDBJob();

  schedule.scheduleJob("*/5 * * * *", async () => {
    syncDBJob();
    await mysNewsJob();
  });
  schedule.scheduleJob("0 */1 * * *", async () => {
    cleanDBJob();
    await updateGachaJob();
  });
}

export { init };
