import lodash from "lodash";
import moment from "moment";
import path from "path";
import pb from "pretty-bytes";
import si from "systeminformation";
import { du } from "#utils/file";

let cpu;
let os;
let versions;

si.cpu().then((c) => (cpu = c));
si.osInfo().then((c) => (os = c));
si.versions("node, npm").then((c) => (versions = c));

(async function status(msg) {
  const unknown = "未知";
  // FIXME 多 QQ 抢占时 load.currentLoad 有概率为 undefined
  const load = await si.currentLoad();
  const mem = await si.mem();
  const time = await si.time();

  const browserVer = lodash.hasIn(global.browser, "version") ? global.browser.version() : unknown;
  const cpuBrand = lodash.hasIn(cpu, "brand") ? cpu.brand : unknown;
  const cpuManufacturer = lodash.hasIn(cpu, "manufacturer") ? cpu.manufacturer : unknown;
  const cpuSpeed = lodash.hasIn(cpu, "speed") ? cpu.speed : unknown;
  const osArch = lodash.hasIn(os, "arch") ? os.arch : unknown;
  const osDistro = lodash.hasIn(os, "distro") ? os.distro : unknown;
  const osKernel = lodash.hasIn(os, "kernel") ? os.kernel : unknown;
  const osPlatform = lodash.hasIn(os, "platform") ? os.platform : unknown;
  const versionsNodeJS = lodash.hasIn(versions, "node") ? versions.node : unknown;
  const versionsNpm = lodash.hasIn(versions, "npm") ? versions.npm : unknown;

  const text = `操作系统：${osPlatform}（${osDistro}）
内核版本：${osKernel}
内核架构：${osArch}
处理器：  ${load.currentLoad && load.currentLoad.toFixed(2)}%（${cpuManufacturer} ${cpuBrand} @ ${cpuSpeed}Ghz）
启动时间：${moment.duration(time.uptime * 1000).humanize()}
内存使用：${((mem.active / mem.total) * 100).toFixed(2)}%（${pb(mem.active)} / ${pb(mem.total)}）
数据占用：${pb(du(path.resolve("data", "db")))}
Node.js:  ${versionsNodeJS}
npm:      ${versionsNpm}
浏览器:   ${browserVer}`;

  msg.bot.say(msg.sid, text, msg.type, msg.uid, false, "\n");
})();
