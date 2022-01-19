./api.js
  getAbyDetail            获取深渊记录
  getBase                 获取账号基本信息
  getCharacters           获取账号角色信息
  getIndex                获取账号信息
  getGachaDetail          获取卡池信息
  getGachaList            获取卡池列表
  getInfo                 获取游戏物品、角色的信息

./auth.js
  checkAuth               权限检查
  setAuth                 设置权限

./cache.js
  getCache                缓存 URL 并获得内容

./config.js
  hasEntrance             检查聊天消息是否是功能入口
  readConfig              读取各个配置文件

./cookie.js
  getCookie               获取一个可用的 Cookie
  textOfInvalidCookies    获得无效 Cookie 的报告文本
  tryToWarnInvalidCookie  尝试根据接口返回信息获得无效 Cookie 的报告文本

./database.js
  clean                   清理数据库
  get                     获取数据
  has                     键的存在性
  includes                值的存在性
  init                    初始化数据库
  push                    插入数据
  remove                  删除数据
  set                     设置数据
  update                  更新数据
  write                   写入数据库

./detail.js
  abyDetail               获取深渊数据
  baseDetail              获取账号基本数据
  characterDetail         获取账号角色数据
  indexDetail             获取账号数据
  handleDetailError       处理上面几个 *Detail 可能抛出的异常

./ds.js
  getDS                   获得用于请求官方 API 的 DS 字段的值

./file.js
  du                      统计文件或文件目录的空间占用
  ls                      递归获取文件目录的内容
  mkdir                   创建文件目录
  readlink                获取文件路径

./oicq.js
  boardcast               发送一条广播
  fromCqcode              将 oicq 2.x 的 message 转换为 oicq 1.x 中的 raw_message
  isGroupBan              是否被群禁言
  isStranger              是否为陌生人
  say                     发送一条消息
  sayMaster               给全体管理员发送一条消息
  toCqcode                将 oicq 1.x 的 raw_message 转换为 oicq 2.x 中的 message

./id.js
  getID                   获取聊天信息中的 UID 或者米游社 ID
  getUID                  获取聊天信息中的 UID

./init.js
  init                    机器人初始化

./load.js
  loadPlugins             加载插件
  processed               处理聊天消息

./merge.js
  merge                   合并数据

./render.js
  render                  使用无头浏览器截图

./tools.js
  filterWordsByRegex      根据正则过滤匹配的子串
  getRandomInt            返回随机整数
  getWordByRegex          根据正则获取匹配的子串
  guessPossibleNames      猜测字符串数组中哪些元素等价于某个名字
  hamming                 计算两个 simhash 的汉明距离
  isPossibleName          猜测字符串数组是否有元素等价于某个名字
  matchBracket            获得匹配的闭括号
  randomString            返回随机字符串
  segment                 简单的词语拆分
  simhash                 计算 simhash
  similarity              计算两个字符串的相似度
  similarityMaxValue      字符串相似的最大值

./update.js
  gachaUpdate             刷新卡池

./yaml.js
  loadYML                 读取配置文件
