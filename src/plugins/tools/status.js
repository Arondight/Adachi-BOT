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
  const str = `OS：${os.distro}
kernel：${os.kernel}
ARCH：${os.arch}
CPU：${load.currentLoad.toFixed(2)}%
MEM：${pb(mem.used)} / ${pb(mem.free)}`;

  await bot.sendMessage(id, str, type);
}

export { status };
