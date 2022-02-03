import fs from "fs";
import lodash from "lodash";
import path from "path";
import puppeteer from "puppeteer";
import url from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { mkdir } from "../src/utils/file.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootdir = path.resolve(__dirname, "..");
const honeyUrl = "https://genshin.honeyhunterworld.com";
let browser;

async function launch() {
  if (undefined === browser) {
    browser = await puppeteer.launch({
      defaultViewport: null,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--no-first-run", "--no-zygote"],
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
    });
  }
}

async function getLink(name, type = "weapon") {
  if (!["weapon", "char"].includes(type)) {
    throw `Unknown type "${type}!"`;
  }

  const db = `${honeyUrl}/db/${type}`;
  const param = "lang=CHS";
  const types = {
    weapon: { sword: "单手剑", claymore: "双手剑", polearm: "长柄武器", bow: "弓", catalyst: "法器" },
    char: { "unreleased-and-upcoming-characters": "测试角色", characters: "角色" },
  };
  const urls = lodash
    .chain(Object.keys(types[type]))
    .map((c) => [types[type][c], `${db}/${c}/?${param}`])
    .fromPairs()
    .value();

  for (const typename of Object.keys(urls)) {
    process.stdout.write(`检测是否为${typename} ……`);

    const page = await browser.newPage();
    await page.goto(urls[typename], { waitUntil: "domcontentloaded" });

    switch (type) {
      case "char": {
        const handers = await page.$x("//div[contains(@class, 'char_sea_cont')]");

        for (const hander of handers) {
          const names = (
            await page.evaluate(
              (...h) => h.map((e) => e.textContent),
              ...(await hander.$x(".//span[contains(@class, 'sea_charname')]"))
            )
          ).filter((c) => "" !== c);

          if (names.includes(name)) {
            const link = await page.evaluate((e) => e.getAttribute("href"), (await hander.$x("./a"))[0]);
            page.close();
            console.log("\t是");
            return link;
          }
        }

        break;
      }
      case "weapon":
        {
          const handers = await page.$x("//table[contains(@class, 'art_stat_table')]");

          for (const hander of handers) {
            const items = (
              await page.evaluate(
                (...h) => h.map((e) => ({ name: e.textContent, link: e.getAttribute("href") })),
                ...(await hander.$x("./tbody/tr/td[3]/a"))
              )
            ).filter((c) => "" !== c.name);

            if (items.map((c) => c.name).includes(name)) {
              const { link } = items.filter((c) => name === c.name)[0];
              page.close();
              console.log("\t是");
              return link;
            }
          }
        }

        break;
    }

    page.close();
    console.log("\t不是");
  }

  return false;
}

async function getData(name, type = "weapon", link) {
  process.stdout.write(`正在拉取“${name}”的数据 ……`);
  console.log("\t假装成功");
  return { type, link };
}

function writeData(name, data = {}, file = undefined) {
  const defaultDir = mkdir(path.resolve(rootdir, "resources_custom", "Version2", "info", "docs"));

  if ("string" !== typeof file) {
    file = path.resolve(defaultDir, `${name}.json`);
  }

  process.stdout.write(`正在写入文件“${file}” ……`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log("\t成功");
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage("-n <string>")
    .example("-n 刻晴")
    .example("-n 天空之刃")
    .help("help")
    .alias("help", "h")
    .version(false)
    .options({
      name: {
        alias: "n",
        type: "string",
        description: "名称",
        requiresArg: true,
        required: false,
      },
      output: {
        alias: "o",
        type: "string",
        description: "目标文件路径",
        requiresArg: true,
        required: false,
      },
    }).argv;

  if ("string" === typeof argv.name && "" !== argv.name) {
    try {
      process.stdout.write("正在启动浏览器 ……");
      await launch();
      console.log("\t成功");

      for (const type of ["char", "weapon"]) {
        const link = await getLink(argv.name, type);

        if ("string" === typeof link) {
          const data = await getData(argv.name, type, link);
          writeData(argv.name, data, argv.output || undefined);
          return;
        }
      }

      console.log(`没有找到名为“${argv.name}”的角色或武器。`);
    } catch (e) {
      console.log(e);
    }
  }
}

main().then((n) => process.exit(n));
