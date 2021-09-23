import si from "systeminformation";
import pb from "pretty-bytes";
import { isMaster } from "../../utils/auth.js";

async function status(id, type, user) {
  if (!isMaster(user)) {
    await bot.sendMessage(id, `[CQ:at,qq=${user}] 不能使用管理命令。`, type);
    return;
  }

  const os = await si.osInfo();
  const cpu = await si.cpu();
  const mem = await si.mem();
  const load = await si.currentLoad();
  const str = `平台：${os.distro}（${os.platform}）
内核：${os.kernel}
架构：${os.arch}
CPU：${load.currentLoad.toFixed(2)}%
内存：${(mem.active / mem.total * 100).toFixed(2)}%（${pb(mem.active)} / ${pb(
    mem.total
  )}）`;

  await bot.sendMessage(id, str, type);
}

export { status };
