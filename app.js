import { fork } from "child_process";
import figlet from "figlet";
import path from "path";
import semver from "semver";
import url from "url";
import "#utils/config";

const m_ME = path.basename(url.fileURLToPath(import.meta.url || ""));

let mPostRunning = false;
const mBot = { name: "机器人", path: path.resolve(global.rootdir, "bot.js"), process: undefined };
const mServer = { name: "文件服务器", path: path.resolve(global.rootdir, "server.js"), process: undefined };

const m_LOG_TYPE = Object.freeze({
  DEBUG: "1",
  INFO: "2",
  ERROR: "3",
});

function log(type, ...rest) {
  let logger;

  switch (type) {
    case m_LOG_TYPE.ERROR:
      logger = console.error;
      break;
    default:
      logger = console.log;
      break;
  }

  return logger(`${m_ME}:`, ...rest);
}

function hello() {
  const asciiArt = figlet.textSync(global.package.name, {
    font: "DOS Rebel",
    horizontalLayout: "full",
    verticalLayout: "full",
    width: 120,
    whitespaceBreak: true,
  });

  log(m_LOG_TYPE.INFO);
  asciiArt.split("\n").forEach((line) => log(m_LOG_TYPE.INFO, line));
  log(m_LOG_TYPE.INFO, `\t\t\t项目主页：${global.package.homepage}`);
  log(m_LOG_TYPE.INFO);
}

function quit() {
  process.kill(process.pid, "SIGTERM");
}

function runBot() {
  log(m_LOG_TYPE.INFO, `正在从 ${mBot.path} 拉起${mBot.name}。`);

  mBot.process = fork(mBot.path);
  mBot.process.on("exit", () => {
    if (false === mPostRunning) {
      log(m_LOG_TYPE.ERROR, `${mBot.name}异常退出！`);
      quit();
    }
  });
}

function runServer(port = 9934) {
  log(m_LOG_TYPE.INFO, `正在从 ${mServer.path} 拉起${mServer.name}。`);

  mServer.process = fork(mServer.path, ["-p", port.toString()]);
  mServer.process.on("exit", () => {
    if (false === mPostRunning) {
      log(m_LOG_TYPE.ERROR, `${mServer.name}异常退出！`);
      runServer(port);
    }
  });
}

function killBot() {
  if (undefined !== mBot.process) {
    log(m_LOG_TYPE.INFO, `正在终止${mBot.name}……`);
    mBot.process.kill();
  }
}

function killServer() {
  if (undefined !== mServer.process) {
    log(m_LOG_TYPE.INFO, `正在终止${mServer.name}……`);
    mServer.process.kill();
  }
}

async function doPost() {
  if (false === mPostRunning) {
    mPostRunning = true; // {

    log(m_LOG_TYPE.INFO, "正在退出……");
    killServer();
    killBot();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    // }
    mPostRunning = false;
  } else {
    while (true === mPostRunning) {
      await new Promise((resolve) => setTimeout(() => resolve(), 100));
    }
  }
}

(async function main() {
  for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"]) {
    process.on(signal, () => doPost().then((n) => process.exit(n)));
  }

  hello();

  if (!semver.satisfies(process.versions.node, global.package.engines.node)) {
    log(m_LOG_TYPE.ERROR, `当前 Node.JS 版本（${process.versions.node}）不满足 ${global.package.engines.node}！`);
    quit();
  }

  runServer();
  runBot();
})();
