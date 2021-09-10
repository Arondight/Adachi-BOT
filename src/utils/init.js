import _puppeteer from "puppeteer";
import _nodeSchedule from "node-schedule";
import { gachaUpdate } from "./update";
import { newServer } from "./server";
import { newDB } from "./database";
var module = {
  exports: {}
};
var exports = module.exports;
const schedule = _nodeSchedule;
const puppeteer = _puppeteer;

const databaseInitialize = () => {
  newDB("map");
  newDB("time");
  newDB("info");
  newDB("artifact");
  newDB("character");
  newDB("authority");
  newDB("gacha", {
    user: [],
    data: []
  });
  newDB("music", {
    source: []
  });
  newDB("aby");
  newDB("cookies", {
    cookie: [],
    uid: []
  });
};

module.exports = async () => {
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
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
};

export default module.exports;