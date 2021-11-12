/* global browser, config, rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import path from "path";

async function render(msg, data, name, scale = 1.5, hello = false) {
  let base64;

  if (hello && config.warnTimeCosts) {
    msg.bot.say(msg.sid, "正在绘图，请稍等……", msg.type, msg.uid);
  }

  try {
    await fs.writeFile(path.resolve(rootdir, "data", "record", `${name}.json`), JSON.stringify(data), () => {});

    const page = await browser.newPage();
    await page.setViewport({
      width: await page.evaluate(() => document.body.clientWidth),
      height: await page.evaluate(() => document.body.clientHeight),
      deviceScaleFactor: scale,
    });
    await page.goto(`http://localhost:9934/src/views/${name}.html`);

    const html = await page.$("body", { waitUntil: "networkidle0" });
    base64 = await html.screenshot({
      encoding: "base64",
      type: "jpeg",
      quality: 100,
      omitBackground: true,
    });
    await page.close();
  } catch (e) {
    msg.bot.logger.error(`${name} 功能绘图失败：${e}`, msg.uid);
    msg.bot.say(msg.sid, "绘图失败。", msg.type, msg.uid);
    return;
  }

  if (base64) {
    const imageCQ = `[CQ:image,file=base64://${base64}]`;
    msg.bot.say(msg.sid, imageCQ, msg.type, msg.uid, "\n");
  }
}

export { render };
