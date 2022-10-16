import { execSync } from "child_process";
import moment from "moment";
import path from "path";
import pb from "pretty-bytes";
import puppeteer from "puppeteer";
import si from "systeminformation";
import { du } from "#utils/file";

("use strict");

const m_UNKNOWN_CN = Object.freeze("未知");

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
  mBrowserVer = m_UNKNOWN_CN;
}

async function status(msg = {}) {
  // FIXME 多 QQ 抢占时 load.currentLoad 有概率为 undefined
  const load = await si.currentLoad();
  const mem = await si.mem();
  const time = await si.time();

  const cpuBrand = mCPU.brand || m_UNKNOWN_CN;
  const cpuManufacturer = mCPU.manufacturer || m_UNKNOWN_CN;
  const cpuSpeed = mCPU.speed || m_UNKNOWN_CN;
  const osArch = mOS.arch || m_UNKNOWN_CN;
  const osDistro = mOS.distro || m_UNKNOWN_CN;
  const osKernel = mOS.kernel || m_UNKNOWN_CN;
  const osPlatform = mOS.platform || m_UNKNOWN_CN;
  const versionsNodeJS = mVersions.node || m_UNKNOWN_CN;
  const versionsNpm = mVersions.npm || m_UNKNOWN_CN;

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

  if ("function" === typeof msg?.bot?.say) {
    msg.bot.say(msg.sid, text, msg.type, msg.uid, false, "\n");
  }

  return { data, text };
}

export { status };
