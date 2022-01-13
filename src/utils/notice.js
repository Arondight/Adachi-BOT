import path from "path";
import lodash from "lodash";
import db from "./database.js";
import { checkAuth } from "./auth.js";
import { getCache } from "./cache.js";

function initDB() {
  for (const t of ["announcement", "event", "information"]) {
    if (!db.includes("news", "timestamp", "type", t)) {
      db.push("news", "timestamp", { type: t, time: 0 });
    }
  }
}

async function mysNewsNotice() {
  if (1 !== global.config.noticeMysNews) {
    return;
  }

  initDB();

  const cacheDir = path.resolve(global.rootdir, "data", "image", "news");
  const data = db.get("news", "data");
  const timestamp = db.get("news", "timestamp");

  for (const t of Object.keys(data)) {
    if (!lodash.hasIn(data[t], ["data", "list"]) || !Array.isArray(data[t].data.list)) {
      continue;
    }

    const lastTimeStamp = (timestamp.find((c) => t === c.type) || {}).time || 0;
    const silent = 0 === lastTimeStamp;
    const news = data[t].data.list;
    let recentStamp = 0;

    for (const n of news) {
      if (!lodash.hasIn(n, "post")) {
        continue;
      }

      const post = n.post || {};
      const { subject, content } = post;
      let image;

      if ("string" === typeof post.images[0]) {
        try {
          image = await getCache(post.images[0], cacheDir, "base64");
        } catch (e) {
          // do nothing
        }
      }

      const imageCQ = undefined !== image ? `[CQ:image,type=image,file=base64://${image}]` : "";
      const url = "string" === typeof post.post_id ? `https://bbs.mihoyo.com/ys/article/${post.post_id}` : "";
      const items = [
        "string" === typeof subject ? subject : "",
        imageCQ,
        "string" === typeof content
          ? "。！？~".split("").includes(content[content.length - 1])
            ? content
            : `${content} ……`
          : "",
        url,
      ];
      const stamp = post.created_at || 0;

      recentStamp = Math.max(stamp, recentStamp);

      if (false === silent && stamp > lastTimeStamp && lodash.some(items, (c) => "string" === typeof c && "" !== c)) {
        const message = items.filter((c) => "string" === typeof c && "" !== c).join("\n");

        for (const bot of global.bots) {
          const max_delay = 2000;
          let count = 0;
          bot.gl.forEach((c) => {
            if (false !== checkAuth({ sid: c.group_id }, global.innerAuthName.mysNews, false)) {
              setTimeout(
                () => bot.say(c.group_id, message, "group"),
                Math.floor(Math.random() * max_delay + 1000) * count++
              );
            }
          });
        }
      }
    }

    db.update("news", "timestamp", { type: t }, { time: recentStamp });
  }
}

export { mysNewsNotice };
