./api.js
  getInfo                 获取游戏物品、角色的信息
  getAbyDetail            获取深渊记录
  getBase                 获取账号基本信息
  getDetail               获取账号信息
  getCharacters           获取账号角色信息
  getGachaList            获取卡池列表
  getGachaDetail          获取卡池信息

./auth.js
  setAuth                 设置权限
  checkAuth               权限检查

./cache.js
  getCache                缓存 URL 并获得内容

./config.js
  readConfig              读取各个配置文件
  hasEntrance             检查聊天消息是否是功能入口

./cookie.js
  getCookie               获取一个可用的 Cookie
  textOfInvalidCookies    获得无效 Cookie 的报告文本
  tryToWarnInvalidCookie  尝试根据接口返回信息获得无效 Cookie 的报告文本

./database.js
  init                    初始化数据库
  has                     键的存在性
  write                   写入数据库
  includes                值的存在性
  remove                  删除数据
  get                     获取数据
  push                    插入数据
  update                  更新数据
  set                     设置数据
  clean                   清理数据库

./detail.js
  abyPromise              获取深渊数据
  basePromise             获取账号基本数据
  detailPromise           获取账号数据
  characterPromise        获取账号角色数据
  handleDetailError       处理上面几个 *Promise 可能抛出的异常

./ds.js
  getDS                   获得用于请求官方 API 的 DS 字段的值

./file.js
  readlink                获取文件路径
  mkdir                   创建文件目录
  ls                      递归获取文件目录的内容
  du                      统计文件或文件目录的空间占用

./id.js
  getUID                  获取聊天信息中的 UID
  getID                   获取聊天信息中的 UID 或者米游社 ID

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
  getRandomInt:           返回随机整数
  randomString:           返回随机字符串
  filterWordsByRegex:     根据正则过滤匹配的子串
  getWordByRegex:         根据正则获取匹配的子串
  segment:                简单的词语拆分
  guessPossibleNames:     根据字符串数组猜那些元素可能包含某个名字
  simhash:                计算 simhash
  hamming:                计算两个 simhash 的汉明值
  hammingText:            计算两段文本的汉明值

./update.js
  gachaUpdate             刷新卡池

./yaml.js
  loadYML                 读取配置文件

