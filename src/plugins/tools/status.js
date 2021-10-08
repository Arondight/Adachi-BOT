import moment from "moment";
import si from "systeminformation";
import pb from "pretty-bytes";
import url from "url";
import path from "path";
import { isMaster } from "../../utils/auth.js";
import { du } from "../../utils/file.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function status(id, type, user, bot) {
  if (!isMaster(user)) {
    await bot.sendMessage(id, "不能使用管理命令。", type, user);
    return;
  }

  const os = await si.osInfo();
  const cpu = await si.cpu();
  const mem = await si.mem();
  const time = await si.time();
  // FIXME 多 QQ 抢占时 load.currentLoad 有概率为 undefined
  const load = await si.currentLoad();
  const str = `平台：${os.platform}（${os.distro}）
内核：${os.kernel}
架构：${os.arch}
CPU：${load.currentLoad && load.currentLoad.toFixed(2)}%（${cpu.manufacturer} ${
    cpu.brand
  } @ ${cpu.speed}Ghz）
内存：${((mem.active / mem.total) * 100).toFixed(2)}%（${pb(mem.active)} / ${pb(
    mem.total
  )}）
启动：${moment.duration(time.uptime * 1000).humanize()}
数据：${pb(du(path.resolve(__dirname, "..", "..", "..", "data", "db")))}`;

  await bot.sendMessage(id, str, type, user, "\n");
}

export { status };
