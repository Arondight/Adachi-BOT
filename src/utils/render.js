import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { mkdir } from "#utils/file";

const settings = {
  selector: {},
  hello: {
    "genshin-aby": true,
    "genshin-card": true,
    "genshin-card-8": true,
    "genshin-package": true,
  },
  scale: {
    "genshin-aby": 2,
    "genshin-artifact": 1.2,
    "genshin-card-8": 2,
    "genshin-material": 2,
  },
  delete: {
    "genshin-artifact": true,
    "genshin-gacha": true,
  },
};
const settingsDefault = { selector: "body", hello: false, scale: 1.5, delete: false };
const renderPath = puppeteer.executablePath();

async function renderOpen() {
  if (undefined === global.browser) {
    global.browser = await puppeteer.launch({
      defaultViewport: null,
      headless: 0 === global.config.viewDebug,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--no-first-run", "--single-process", "--no-zygote"],
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
    });
  }
}

async function renderClose() {
  if (undefined !== global.browser) {
    await global.browser.close();
    global.browser = undefined;
  }
}

async function render(msg, data, name) {
  const recordDir = path.resolve(global.rootdir, "data", "record");
  let binary;

  if ((settings.hello[name] || settingsDefault.hello) && global.config.warnTimeCosts && undefined !== msg.bot) {
    msg.bot.say(msg.sid, "正在绘图，请稍等……", msg.type, msg.uid, true);
  }

  // 抽卡信息太多时减少缩放比
  if ("genshin-gacha" === name && Array.isArray(data.data) && data.data.length > 10) {
    settings.scale["genshin-gacha"] = 1;
  }

  try {
    const dataStr = JSON.stringify(data);

    if (undefined !== msg.bot) {
      // 该文件仅用于辅助前端调试，无实际作用亦不阻塞
      const record = path.resolve(mkdir(path.resolve(recordDir, "last_params")), `${name}.json`);
      fs.writeFile(record, dataStr, () => {});

      if (undefined !== msg.bot) {
        msg.bot.logger.debug(`render：已生成 ${name} 功能的数据调试文件。`);
      }
    }

    if (undefined === global.browser) {
      throw "未找到可用的浏览器";
    }

    const page = await global.browser.newPage();
    const scale = settings.scale[name] || settingsDefault.scale;

    // 只在机器人发送图片时设置 viewport
    if (undefined !== msg.bot) {
      await page.setViewport({
        width: await page.evaluate(() => document.body.clientWidth),
        height: await page.evaluate(() => document.body.clientHeight),
        deviceScaleFactor: scale,
      });
    }

    if (undefined !== msg.bot) {
      msg.bot.logger.debug(`render：已设置 ${name} 功能的缩放比为 ${scale} 。`);
    }

    // 数据使用 URL 参数传入
    const param = { data: new Buffer.from(dataStr, "utf8").toString("base64") };
    await page.goto(`http://localhost:9934/src/views/${name}.html?${new URLSearchParams(param)}`);

    const html = await page.$(settings.selector[name] || settingsDefault.selector, { waitUntil: "networkidle0" });
    binary = await html.screenshot({
      encoding: "binary",
      type: "jpeg",
      quality: 100,
      omitBackground: true,
    });

    if (0 === global.config.viewDebug) {
      await page.close();
    }
  } catch (e) {
    if (undefined !== msg.bot) {
      msg.bot.logger.error(`错误： ${name} 功能绘图失败，因为“${e}”。`, msg.uid);
      msg.bot.say(msg.sid, "绘图失败。", msg.type, msg.uid, true);
    }
    return;
  }

  if (binary) {
    const base64 = new Buffer.from(binary, "utf8").toString("base64");
    const imageCQ = `[CQ:image,type=image,file=base64://${base64}]`;
    const toDelete = undefined === settings.delete[name] ? settingsDefault.delete : settings.delete[name];
    const record = path.resolve(mkdir(path.resolve(recordDir, name)), `${msg.sid}.jpeg`);

    if (undefined !== msg.bot) {
      msg.bot.say(msg.sid, imageCQ, msg.type, msg.uid, toDelete, "\n");

      if (1 === global.config.saveImage) {
        fs.writeFile(record, binary, () => {});
      }
    }
  }
}

export { render, renderClose, renderOpen, renderPath };
