import fs from "fs";
import path from "path";

async function loadPlugins() {
  const plugins = {};
  const enableList = { ...global.command.enable, ...global.master.enable };
  const pluginLoadPath = path.resolve(global.rootdir, "src", "plugins");
  const pluginDirList =
    fs.readdirSync(pluginLoadPath).filter((f) => f && fs.statSync(path.resolve(pluginLoadPath, f)).isDirectory()) || [];

  for (const dir of pluginDirList) {
    const plugin = dir.toLowerCase();

    if (plugin in global.all.function) {
      if (enableList[plugin] && true === enableList[plugin]) {
        try {
          plugins[plugin] = await import(`../plugins/${dir}/index.js`);
          global.bots.logger.debug(`插件：加载 ${plugin} 成功。`);
        } catch (e) {
          global.bots.logger.error(`错误：加载 ${plugin} 插件失败，因为“${e}”。`);
        }
      } else {
        global.bots.logger.warn(`插件：拒绝加载被禁用的插件 ${plugin} ！`);
      }
    } else {
      global.bots.logger.warn(`插件：拒绝加载未知插件 ${plugin} ！`);
    }
  }

  return plugins;
}

export { loadPlugins };
