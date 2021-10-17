/* global bots */
/* eslint no-undef: "error" */

import schedule from "node-schedule";
import puppeteer from "puppeteer";
import db from "./database.js";
import { server } from "./server.js";
import { gachaUpdate as updateGachaJob } from "./update.js";

async function initDB() {
  await db.init("aby");
  await db.init("artifact");
  await db.init("authority");
  await db.init("character");
  await db.init("cookies", { cookie: [], uid: [] });
  await db.init("cookies_invalid", { cookie: [] });
  await db.init("gacha", { user: [], data: [] });
  await db.init("info");
  await db.init("map");
  await db.init("music", { source: [] });
  await db.init("time");
}

async function initBrowser() {
  global.browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

async function cleanDB(name) {
  let nums = await db.clean(name);

  // 只打印一次日志
  bots[0] &&
    bots[0].logger.debug(`清理：删除数据库 ${name} 中 ${nums} 条无用记录。`);
  return nums;
}

async function cleanDBJob() {
  let nums = 0;
  nums += await cleanDB("aby");
  nums += await cleanDB("cookies");
  nums += await cleanDB("cookies_invalid");
  nums += await cleanDB("info");
  return nums;
}

async function init() {
  await initDB();
  await initBrowser();

  updateGachaJob();
  await cleanDBJob();

  schedule.scheduleJob("1 */1 * * *", () => updateGachaJob());
  schedule.scheduleJob("1 */1 * * *", async () => await cleanDBJob());

  server(9934);
}

export default init;
