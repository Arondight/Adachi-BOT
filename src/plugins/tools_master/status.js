import { execSync } from "child_process";
import lodash from "lodash";
import moment from "moment";
import path from "path";
import pb from "pretty-bytes";
import puppeteer from "puppeteer";
import si from "systeminformation";
import { du } from "#utils/file";

const mUnknown = "未知";

let mBrowserVer;
let mCPU;
let mOS;
let mVersions;

si.cpu().then((c) => (mCPU = c));
si.osInfo().then((c) => (mOS = c));
si.versions("node, npm").then((c) => (mVersions = c));

try {
  const items = ["BaseName", "VersionInfo.ProductVersion"];
  const fstr = `powershell -command "&{(Get-Item '${puppeteer.executablePath()}').{}}"`;
  const outputs = [];

  items.forEach((c) => outputs.push(execSync(fstr.replace("{}", c), { stdio: "pipe" }).toString().trim()));
  mBrowserVer = outputs.join(" ");
} catch (e) {
  // do nothing
}

try {
  const cmd = `'${puppeteer.executablePath()}' --version`;

  if (undefined === mBrowserVer) {
    mBrowserVer = execSync(cmd, { stdio: "pipe" }).toString().trim();
  }
} catch (e) {
  // do nothing
}

if (undefined === mBrowserVer) {
  mBrowserVer = mUnknown;
}

async function status(msg = {}) {
  // FIXME 多 QQ 抢占时 load.currentLoad 有概率为 undefined
  const load = await si.currentLoad();
  const mem = await si.mem();
  const time = await si.time();

  const cpuBrand = lodash.hasIn(mCPU, "brand") ? mCPU.brand : mUnknown;
  const cpuManufacturer = lodash.hasIn(mCPU, "manufacturer") ? mCPU.manufacturer : mUnknown;
  const cpuSpeed = lodash.hasIn(mCPU, "speed") ? mCPU.speed : mUnknown;
  const osArch = lodash.hasIn(mOS, "arch") ? mOS.arch : mUnknown;
  const osDistro = lodash.hasIn(mOS, "distro") ? mOS.distro : mUnknown;
  const osKernel = lodash.hasIn(mOS, "kernel") ? mOS.kernel : mUnknown;
  const osPlatform = lodash.hasIn(mOS, "platform") ? mOS.platform : mUnknown;
  const versionsNodeJS = lodash.hasIn(mVersions, "node") ? mVersions.node : mUnknown;
  const versionsNpm = lodash.hasIn(mVersions, "npm") ? mVersions.npm : mUnknown;

  const data = {
    操作系统: `${osPlatform}（${osDistro}）`,
    内核版本: osKernel,
    内核架构: osArch,
    处理器: `${load.currentLoad && load.currentLoad.toFixed(2)}%（${cpuManufacturer} ${cpuBrand} @ ${cpuSpeed}Ghz）`,
    启动时间: moment.duration(time.uptime * 1000).humanize(),
    内存使用: `${((mem.active / mem.total) * 100).toFixed(2)}%（${pb(mem.active)} / ${pb(mem.total)}）`,
    数据占用: pb(du(path.resolve(global.datadir, "db"))),
    "Node.js": versionsNodeJS,
    npm: versionsNpm,
    浏览器: mBrowserVer,
  };
  const text = Object.entries(data)
    .map(
      ([k, v]) =>
        `${k}：${" ".repeat(
          8 -
            k
              .split("")
              .map((c) => (c.charCodeAt(0) > 127 ? 2 : 1))
              .reduce((p, v) => p + v, 0)
        )}${v}`
    )
    .join("\n");

  if (lodash.hasIn(msg, "bot.say")) {
    msg.bot.say(msg.sid, text, msg.type, msg.uid, false, "\n");
  }

  return { data, text };
}

export { status };
