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
    const dataStr = JSON.stringify(data);
    const record = path.resolve(rootdir, "data", "record", `${name}.json`);
    // 该文件仅用作调试，无实际作用亦不阻塞
    fs.writeFile(record, dataStr, () => {});

    const page = await browser.newPage();
    await page.setViewport({
      width: await page.evaluate(() => document.body.clientWidth),
      height: await page.evaluate(() => document.body.clientHeight),
      deviceScaleFactor: scale,
    });
    // 数据使用 URL 参数传入
    const param = { data: new Buffer.from(dataStr, "utf8").toString("base64") };
    await page.goto(`http://localhost:9934/src/views/${name}.html?${new URLSearchParams(param).toString()}`);

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
