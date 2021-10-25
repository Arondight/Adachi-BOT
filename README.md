# Adachi-BOT

## 说明

### 关于

本项目提供了一个在 QQ 中运行的原神助手，与之聊天可以方便地查询玩家数据和游戏信息、模拟抽卡、模拟刷圣遗物，以及一些其他的[功能](https://github.com/Arondight/Adachi-BOT#%E5%8A%9F%E8%83%BD)。[原项目](https://github.com/SilveryStar/Adachi-BOT)的[该版本](https://github.com/SilveryStar/Adachi-BOT/tree/ver1.4.6)已经不再维护，此项目当前会持续更新。

### 文档

1. 常见问题请参阅 [FAQ](https://github.com/Arondight/Adachi-BOT/issues?q=label%3Adocumentation) 。
2. 资源文件提交请查阅[资源制作](docs/资源制作.md)。
3. 插件开发请查阅[开发指引](docs/开发指引.md)。

### 开发

1. 代码提交前运行 `npm run check` 进行检查确保无报错，并运行 `npm run format` 进行格式化。
2. 代码自测完毕后发起 [Pull request](https://github.com/Arondight/Adachi-BOT/pulls) 合入 `dev` 分支。
3. 新功能添加或者功能修改请先发起 [Issue](https://github.com/Arondight/Adachi-BOT/issues) 询问我的意愿，根据沟通结果选择合入本项目或者提交到你账户下的一个 Fork 。漏洞修复无需事先沟通，直接发起 [Pull request](https://github.com/Arondight/Adachi-BOT/pulls) 并描述清楚问题即可。

## 使用

### 部署

#### 准备环境

> 建议提供一个内存和交换空间容量**总和**达到 `1.5 GiB` 的 Linux 环境进行部署，以运行无头浏览器。

首先你需要有一份较新的 [Node.js](https://nodejs.org/en/download/) ，本项目不兼容较旧版本的 Node.js 。

<details>

##### CentOS、RHEL

```
sudo yum -y remove nodejs
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum -y install nodejs
```

##### Ubuntu、Debian

```
sudo apt -y remove nodejs
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt -y install nodejs
```

</details>

#### 部署项目

> 本项目原则上只做 Linux 系统的支持，所有代码合入主线之前也只在 Linux 上进行测试，推荐使用一个主流的[发行版](https://zh.wikipedia.org/wiki/Linux%E5%8F%91%E8%A1%8C%E7%89%88)（例如 [CentOS](https://www.centos.org/) ）进行部署。如果你执意要在 Windows 系统上进行部署，请参照我在 [FAQ](https://github.com/Arondight/Adachi-BOT/issues?q=label%3Adocumentation) 中写的《如何在 Windows 系统上进行部署》，注意虽然这份说明是出自我之手，但是不表示我推荐在 Windows 系统上部署本项目。

```
git clone https://github.com/Arondight/Adachi-BOT.git
cd ./Adachi-BOT/
npm install
```

如果 `puppeteer` 模块下载 `Chromium` 失败，那么玩家的数据查询功能将无法使用，此时……

<details>

你有两种选择。首先删除 `./node_modules/` 目录。

其一，（推荐）使用系统自带的 `Chromium` ，这里以 `CentOS` 为例，执行以下命令。

```
sudo yum -y install epel-release
sudo yum -y install chromium
SHRC="${HOME}/.bashrc"
BROWER_BIN='/usr/lib64/chromium-browser/chromium-browser'
VAR_PATH='PUPPETEER_EXECUTABLE_PATH'
VAR_SKIP='PUPPETEER_SKIP_CHROMIUM_DOWNLOAD'
grep "$VAR_PATH" "$SHRC" || ( echo "export ${VAR_PATH}='${BROWER_BIN}'" | tee -a "$SHRC" )
grep "$VAR_SKIP" "$SHRC" || ( echo "export ${VAR_SKIP}='true'" | tee -a "$SHRC" )
source "$SHRC"
npm install
```

> 1. `BROWER_BIN` 需要设置为 `Chromium` 的二进制可执行文件路径，而非启动脚本或其链接的路径。
> 2. `SHRC` 是 `shell` 配置文件的路径，这里用的是 `bash` 。

其二，通过任意合法途径获得一个可以访问国际互联网的 `http` 代理，然后执行以下命令。

```
npm_config_proxy=http://<ip>:<port> npm install
```

</details>

### 配置

首次配置，进入本项目所在的目录 `./Adachi-BOT/`，执行以下命令复制默认配置文件 `setting.yml` 和 `cookies.yml` 。

```
cp -iv ./config_defaults/{setting,cookies}.yml ./config/
```

然后需要编辑以下文件，根据注释填入合适的配置。

| 文件 | 作用 |
| --- | --- |
| [setting.yml](config_defaults/setting.yml) | 基本配置选项 |
| [cookies.yml](config_defaults/cookies.yml) | 米游社Cookie |

> 你可以在 [yamlchecker.com](https://yamlchecker.com/) 网站上检查你写的配置文件语法是否正确，只需要将配置文件的内容复制到文本框中即可。

你也可以从 `./config_defaults/` 下复制更多的文件到 `./config/` 来进行自定义配置。但是有些配置文件如果你不想自己维护（例如 `artifacts.yml` ），那就不要把它们放到 `./config/` 下。通常来说，你只需要在 `./config/` 下存放 `setting.yml` 和 `cookies.yml` 就够了。

### 运行

进入本项目所在的目录 `./Adachi-BOT/` 。

| 动作 | 命令 |
| --- | --- |
| 初始化 | `npm run init` |
| 启动 | `npm run start` |
| 重启 | `npm run restart` |
| 停止 | `npm run stop` |
| 允许开机启动 | `npm run startup` |
| 禁止开机启动 | `npm run unstartup` |
| 查看状态 | `npm run list` |
| 查看日志 | `npm run log` |

> 1. 首次运行必须**进行初始化**以完成 QQ 的新设备认证，随后按下组合键 `Ctrl+C` 停止，此时初始化完成。
> 2. 需要启动一次后才可以允许、禁止开机启动。

### 更新

进入本项目所在的目录。

#### 检查更新

```
./scripts/is_there_an_update_available.sh
```

#### 进行更新

```
git pull -p
npm install
```

#### 查看配置文件变更

```
./scripts/whats_updated_in_the_configuration_files.sh
```

> 你可以使用 [Meld](http://meldmerge.org/) 把 `config_defaults/` 中的变更合并到 `config/` 里。

#### 重启机器人

```
npm run restart
```

## 功能

### 所有功能

> 具体命令请查看[这里](config_defaults/command.yml)，一些只供管理者使用的主人命令请查看[这里](config_defaults/command_master.yml)。

| 功能 | 形式 | 权限开关 | 主人命令 |
| --- | --- | --- | --- |
| 展示米游社 ID 、 UID 或者某个群友的游戏账号 | 插件 | ✔️ | ❌ |
| 展示米游社 ID 、 UID 或者某个群友的深渊战绩 | 插件 | ✔️ | ❌ |
| 米游社ID绑定和改绑 | 插件 | ❌ | ❌ |
| 圣遗物掉落和强化 | 插件 | ✔️ | ❌ |
| 圣遗物截图评分 | 插件 | ✔️ | ❌ |
| 展示角色官方数据 | 插件 | ✔️ | ❌ |
| 祈愿十连（支持定轨） | 插件 | ✔️ | ❌ |
| 今天该刷什么 | 插件 | ❌ | ❌ |
| 今天吃什么 | 插件 | ❌ | ❌ |
| 点歌 | 插件 | ✔️ | ❌ |
| 掷骰子 | 插件 | ❌ | ❌ |
| 求签 | 插件 | ❌ | ❌ |
| 主人和其他好友或群聊天、发送广播 | 插件 | ❌ | ✔️ |
| 查看、搜索和统计添加的好友和群 | 插件 | ❌ | ✔️ |
| 群广播和好友广播 | 插件 | ❌ | ✔️ |
| 查看宿主系统状态| 插件 | ❌ | ✔️ |
| 报告无效 Cookie | 插件 | ❌ | ✔️ |
| 其他管理功能和权限控制开关 | 插件 | ❌ | ✔️ |
| 随机复读群信息 | 自有功能 | ❌ | ❌ |
| 停止响应指定群 | 自有功能 | ❌ | ❌ |
| 自我介绍 | 自有功能 | ❌ | ❌ |
| 上线通知 | 自有功能 | ❌ | ❌ |

### 图片示例

> 1. 有些样式可能已经变更。
> 2. 仅展示了部分功能。

<details>
  <summary>展示玩家信息</summary>
  <div align="center">

![米游社](images/米游社.png)

  </div>
</details>

<details>
  <summary>查询我的角色</summary>
  <div align="center">

![我的](images/我的.png)

  </div>
</details>

<details>
  <summary>查询深渊战绩</summary>
  <div align="center">

![深渊](images/深渊.png)

  </div>
</details>


<details>
  <summary>圣遗物掉落和强化</summary>
  <div align="center">

![圣遗物](images/圣遗物.png)
![强化](images/强化.png)

  </div>
</details>

<details>
  <summary>祈愿十连</summary>
  <div align="center">

![十连](images/十连.png)

  </div>
</details>

<details>
  <summary>游戏数据查询</summary>
  <div align="center">

![角色](images/角色.png)
![武器](images/武器.png)

  </div>
</details>

## 致谢

感谢以下人员以及未提及的[贡献者](https://github.com/Arondight/Adachi-BOT/graphs/contributors)们，你们让一切变得更好了。

| 人员 | 贡献 |
| --- | --- |
| [490720818](https://github.com/490720818) | 编写了深渊查询的原始版本 |
| [Mark9804](https://github.com/Mark9804) | 贡献了诸多资源文件，[前端部分](src/views)的开发及维护 |
| [SilveryStar](https://github.com/SilveryStar) | 编写了项目的原始版本，这是一切的开始 |
| [Xm798](https://github.com/Xm798) | 贡献了诸多资源文件 |
| [buzhibujuelb](https://github.com/buzhibujuelb) | 添加了武器定轨机制，美化了抽卡效果 |
| [coolrc136](https://github.com/coolrc136) | 为项目提供了直接技术支持 |
| [ixCiel](https://github.com/ixCiel) | 优化了 Cookie 池使用逻辑 |

> 名单先后顺序根据账号首字母排列。

## Licenses

[MIT](LICENSE) 。
