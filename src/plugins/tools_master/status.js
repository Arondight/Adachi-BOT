import moment from "moment";
import path from "path";
import pb from "pretty-bytes";
import si from "systeminformation";
import { du } from "#utils/file";

async function status(msg) {
  const os = await si.osInfo();
  const cpu = await si.cpu();
  const mem = await si.mem();
  const time = await si.time();
  // FIXME 多 QQ 抢占时 load.currentLoad 有概率为 undefined
  const load = await si.currentLoad();
  const str = `平台：${os.platform}（${os.distro}）
内核：${os.kernel}
架构：${os.arch}
CPU：${load.currentLoad && load.currentLoad.toFixed(2)}%（${cpu.manufacturer} ${cpu.brand} @ ${cpu.speed}Ghz）
内存：${((mem.active / mem.total) * 100).toFixed(2)}%（${pb(mem.active)} / ${pb(mem.total)}）
启动：${moment.duration(time.uptime * 1000).humanize()}
数据：${pb(du(path.resolve("data", "db")))}`;

  msg.bot.say(msg.sid, str, msg.type, msg.uid, false, "\n");
}

export { status };
