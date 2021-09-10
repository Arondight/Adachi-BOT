import puppeteer from "puppeteer";
import schedule from "node-schedule";
import { gachaUpdate } from "./update.js";
import { newServer } from "./server.js";
import { newDB } from "./database.js";

function databaseInitialize() {
  newDB("map");
  newDB("time");
  newDB("info");
  newDB("artifact");
  newDB("character");
  newDB("authority");
  newDB("gacha", { user: [], data: [] });
  newDB("music", { source: [] });
  newDB("aby");
  newDB("cookies", { cookie: [], uid: [] });
}

async function init() {
  newServer(9934);
  databaseInitialize();
  gachaUpdate();
  schedule.scheduleJob("0 31 11 * * *", () => {
    gachaUpdate();
  });
  schedule.scheduleJob("0 1 18 * * *", () => {
    gachaUpdate();
  });
  global.browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export default init;
