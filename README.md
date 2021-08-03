# Adachi-BOT

## 说明

[原项目](https://github.com/SilveryStar/Adachi-BOT)的[该版本](https://github.com/SilveryStar/Adachi-BOT/tree/ver1.4.6)已经不再维护，此项目当前会持续更新。

开发请查阅[手册](docs/README.md)。

## 使用

### 部署

```
git clone https://github.com/Arondight/Adachi-BOT.git
cd ./Adachi-BOT/
npm install
```

如果`puppeteer`模块下载`Chromium`失败，那么`Adachi-BOT`将无法正常运行……

<details>

此时你有两种选择。

其一，通过任意合法途径获得一个可以访问国际互联网的`http`代理，然后执行以下命令。

```
npm_config_proxy=http://<ip>:<port> npm install
```

其二，尝试改用`Firefox`，执行以下命令。

```
PUPPETEER_PRODUCT=firefox npm install
```

</details>

### 配置

需要编辑以下文件，根据注释填入合适的配置。

| 文件 | 作用 |
| --- | --- |
| [config/setting.yml](config/setting.yml) | QQ号登录选项 |
| [config/cookies.yml](config/cookies.yml) | 米游社Cookie |

### 运行

#### 手动运行

进入`Adachi-BOT`项目所在目录。

```
PM2_HOME=$(pwd)/bot.pm2 ./node_modules/.bin/pm2 start ./app.js --name bot
PM2_HOME=$(pwd)/bot.pm2 ./node_modules/.bin/pm2 save
```

#### 开机启动

进入`Adachi-BOT`项目所在目录。手动运行后执行。

```
PM2_HOME=$(pwd)/bot.pm2 ./node_modules/.bin/pm2 startup
```

### 更新

进入`Adachi-BOT`项目所在目录。

```
git pull -p
PM2_HOME=$(pwd)/bot.pm2 ./node_modules/.bin/pm2 restart bot
```

### 其他操作

<details>

#### 查看状态

进入`Adachi-BOT`项目所在目录。

```
PM2_HOME=$(pwd)/bot.pm2 ./node_modules/.bin/pm2 list bot
```

#### 查看日志

进入`Adachi-BOT`项目所在目录。

```
PM2_HOME=$(pwd)/bot.pm2 ./node_modules/.bin/pm2 log bot
```

#### 手动停止

进入`Adachi-BOT`项目所在目录。

```
PM2_HOME=$(pwd)/bot.pm2 ./node_modules/.bin/pm2 stop bot
```

</details>

## 功能

### 所有功能

> 具体命令请查看(src/plugins/tools/help.js)[src/plugins/tools/help.js]。

| 功能 | 形式 |
| --- | --- |
| 展示米游社ID下的游戏账号 | 插件 |
| 展示UID对应的游戏账号 | 插件 |
| 展示UID对应的深渊战绩 | 插件 |
| 米游社ID绑定和改绑 | 插件 |
| 圣遗物掉落和强化 | 插件 |
| 展示角色官方数据 | 插件 |
| 祈愿十连 | 插件 |
| 今天该刷什么 | 插件 |
| 今天吃什么 | 插件 |
| 掷骰子 | 插件 |
| 点歌 | 插件 |
| 伟大的升华 | 插件 |
| 随机复读群信息 | 主程序 |
| 给主人带个话 | 插件 |
| 管理功能 | 插件 |

### 图片示例

> 1. 有些样式已经变更，但是图片依然展示了旧的样式。
> 2. 仅展示了部分功能。

<details>
<summary>展示玩家信息</summary>
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT/CardExample.png" alt="ERROR">
</div>
</details>

<details>
<summary>查询我的角色</summary>
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT-v2/anemo-character.png" alt="ERROR">
</div>
</details>

<details>
<summary>圣遗物掉落和强化</summary>
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT-v2/artifact-init.png" alt="ERROR">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT-v2/artifact-rein.png" alt="ERROR">
</div>
</details>

<details>
<summary>祈愿十连</summary>
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT-v2/character-wish.png" alt="ERROR">
</div>
</details>

<details>
<summary>游戏数据查询</summary>
<div align="center">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT-v2/character-info-4.png" alt="ERROR">
  <img src="https://github.com/SilveryStar/image/blob/master/Adachi-BOT-v2/weapon-info-4.png" alt="ERROR">
</div>
</details>

## Licenses

[MIT](LICENSE)

