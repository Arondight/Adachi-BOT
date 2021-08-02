# 开发指引

## 结构

```
Adachi-BOT
├─ config
│  ├─ artifact.yml          圣遗物配置
│  ├─ cookies.yml           cookie设置
│  ├─ command.yml           命令正则
│  └─ setting.yml           基本配置
├─ data                     资源目录
│  ├─ record                数据缓存
│  ├─ db                    数据库文件
│  ├─ font                  字体资源
│  └─ js                    外部资源
├─ src                      源码目录
│  ├─ plugins               插件代码
│  ├─ utils                 工具代码
│  └─ views                 前端代码
└─ app.js                   程序入口
```

## 插件

1. 在`src/plugins`目录下创建插件目录
2. 在`config/command.yml`中添加正则匹配
3. 如有需要，在`src/utils/init.js`中加载数据库

## 数据库

本项目数据库简易封装了[lowDB](https://github.com/typicode/lowdb)。你也可以根据需要在`src/utils/database.js`中定义自己的方法。

### 创建数据库

```js
// 创建一个名称为 name 的数据库，默认值设置为 { user: [] }
// 在 src/utils/database.js 中使用，以便启动时初始化
newDB(name: string, default?: object)
```

### 插入数据

```js
// 在数据库 name 中的 key 对应的对象数组中，插入一条数据 data
push(name: string, key: string, data: object)
```

### 获取数据

```js
// 在数据库 name 中的 key 对应的对象数组中，获取包含索引 index 的对象
get(name: string, key: string, index: object)
```

### 更新数据

```js
// 在数据库 name 中的 key 对应的对象数组中，将包含索引 index 的对象更新为 data
// 注意，该方法只会更新 data 中包含的 key-value 对，不会修改其他数据
update(name: string, key: string, index: object, data: object)
```

### 判断是否含有数据

```js
// 在数据库 name 中的 key 对应的对象数组中，检测所有的索引 index 在是否包含值 value
isInside(name: string, key: string, index: string, value: any)
```

### 设置数据

```js
// 在数据库 name 中的 key 对应的数据设置为 data
set(name: string, key: string, data: any)
```

