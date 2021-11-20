/* global config, rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const settings = {
  hello: {
    "genshin-aby": true,
    "genshin-artifact": false,
    "genshin-card": true,
    "genshin-character": false,
    "genshin-gacha": false,
    "genshin-overview": false,
    "genshin-info": true,
  },
  scale: {
    "genshin-aby": 2,
    "genshin-artifact": 1.2,
    "genshin-card": 1.5,
    "genshin-character": 1.5,
    "genshin-gacha": 1.5,
    "genshin-overview": 1.2,
    "genshin-info": 1.5,
  },
  delete: {
    "genshin-aby": false,
    "genshin-artifact": true,
    "genshin-card": false,
    "genshin-character": false,
    "genshin-gacha": true,
    "genshin-overview": false,
    "genshin-info": false,
  },
};
const settingsDefault = { hello: false, scale: 1.5, delete: false };
let browser;

async function launch() {
  if (undefined === browser) {
    browser = await puppeteer.launch({
      defaultViewport: null,
      headless: 0 === config.viewDebug,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

async function render(msg, data, name) {
  let base64;

  if ((settings.hello[name] || settingsDefault.hello) && config.warnTimeCosts) {
    msg.bot && msg.bot.say(msg.sid, "正在绘图，请稍等……", msg.type, msg.uid, true);
  }

  try {
    const dataStr = JSON.stringify(data);

    if ("string" === typeof rootdir) {
      // 该文件仅用于辅助前端调试，无实际作用亦不阻塞
      const record = path.resolve(rootdir, "data", "record", `${name}.json`);
      fs.writeFile(record, dataStr, () => {});
      msg.bot && msg.bot.logger.debug(`render：已生成 ${name} 功能的数据调试文件。`);
    }

    await launch();
    const page = await browser.newPage();

    // 只在机器人发送图片时设置 viewport
    if (msg.bot) {
      await page.setViewport({
        width: await page.evaluate(() => document.body.clientWidth),
        height: await page.evaluate(() => document.body.clientHeight),
        deviceScaleFactor: settings.scale[name] || settingsDefault.scale,
      });
    }

    // 数据使用 URL 参数传入
    const param = { data: new Buffer.from(dataStr, "utf8").toString("base64") };
    await page.goto(`http://localhost:9934/src/views/${name}.html?${new URLSearchParams(param)}`);

    const html = await page.$("body", { waitUntil: "networkidle0" });
    base64 = await html.screenshot({
      encoding: "base64",
      type: "jpeg",
      quality: 100,
      omitBackground: true,
    });

    if (0 === config.viewDebug) {
      await page.close();
    }
  } catch (e) {
    msg.bot && msg.bot.logger.error(`render： ${name} 功能绘图失败：${e}`, msg.uid);
    msg.bot && msg.bot.say(msg.sid, "绘图失败。", msg.type, msg.uid, true);
    return;
  }

  if (base64) {
    const imageCQ = `[CQ:image,file=base64://${base64}]`;
    const toDelete = undefined === settings.delete[name] ? settingsDefault.delete : settings.delete[name];
    msg.bot && msg.bot.say(msg.sid, imageCQ, msg.type, msg.uid, toDelete, "\n");
  }
}

export { render };
