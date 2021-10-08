import fs from "fs";
import { Mutex } from "./mutex.js";

const mutex = new Mutex();

async function render(data, name, id, type, user, bot) {
  let base64;

  try {
    await mutex.acquire();

    const page = await browser.newPage();

    await fs.writeFile(
      `./data/record/${name}.json`,
      JSON.stringify(data),
      () => {}
    );
    await page.goto(`http://localhost:9934/src/views/${name}.html`);

    const htmlElement = await page.$("body");
    base64 = await htmlElement.screenshot({
      encoding: "base64",
    });

    await page.close();
  } catch (err) {
    bot.logger.error(`${name} 功能绘图失败：${err}`, user);
  } finally {
    mutex.release();
  }

  if (base64) {
    const imageCQ = `[CQ:image,file=base64://${base64}]`;
    await bot.sendMessage(id, imageCQ, type, user, "\n");
  }
}

export { render };
