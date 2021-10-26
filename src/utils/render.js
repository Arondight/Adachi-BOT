/* global browser, rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import path from "path";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

async function render(data, name, id, type, user, bot, scale = 1.5) {
  let base64;

  await fs.writeFile(
    path.resolve(rootdir, "data", "record", `${name}.json`),
    JSON.stringify(data),
    () => {}
  );

  const release = await mutex.acquire();

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: await page.evaluate(() => document.body.clientWidth),
      height: await page.evaluate(() => document.body.clientHeight),
      deviceScaleFactor: scale,
    });
    await page.goto(`http://localhost:9934/src/views/${name}.html`);
    await page.evaluateHandle("document.fonts.ready");

    const html = await page.$("body", { waitUntil: "networkidle0" });
    base64 = await html.screenshot({
      encoding: "base64",
      type: "jpeg",
      quality: 100,
      omitBackground: true,
    });
    await page.close();
  } catch (e) {
    bot.logger.error(`${name} 功能绘图失败：${e}`, user);
  } finally {
    release();
  }

  if (base64) {
    const imageCQ = `[CQ:image,file=base64://${base64}]`;
    await bot.sendMessage(id, imageCQ, type, user, "\n");
  }
}

export { render };
