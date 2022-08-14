import fs from "fs";
import lodash from "lodash";
import fetch from "node-fetch";
import path from "path";
import "#utils/config";

const file = path.resolve(global.rootdir, "resources", "Version2", "info", "image", "material.json");
const api = "https://api.ambr.top/v2/CHS/material/";

function parse(types, items) {
  const parsed = [];

  for (const item of Object.values(items)) {
    if (Object.keys(types).includes(item.type)) {
      item.type = types[item.type];
      item.rarity = item.rank;

      if (undefined === item.beta) {
        item.beta = false;
      }
    }

    parsed.push(lodash.pick(item, ["id", "name", "type", "rarity", "beta"]));
  }

  return parsed;
}

(async function main() {
  const data = { types: [], items: [] };

  try {
    process.stdout.write(`正在从 ${api} 获取数据 ...\t`);

    const response = await fetch(api, { method: "GET" });

    if (200 === response.status) {
      const jbody = await response.json();

      if (200 === jbody.response) {
        data.types = Object.values(jbody.data.types);
        data.items = parse(jbody.data.types, jbody.data.items);
      }
    }
  } catch (e) {
    console.log("失败");
    return -1;
  }

  if (undefined === data || 0 === Object.keys(data).length) {
    console.log("失败");
    return -1;
  }

  console.log("成功");

  try {
    process.stdout.write(`正在写入 ${file} ...\t`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log("成功");
  } catch (e) {
    console.log("失败");
    return -1;
  }

  return 0;
})()
  .then((n) => process.exit("number" === typeof n ? n : 0))
  .catch((e) => console.log(e))
  .finally(() => process.exit(-1));
