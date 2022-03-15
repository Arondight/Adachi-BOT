import lodash from "lodash";
import path from "path";
import { getMysNews } from "#utils/api";
import { checkAuth } from "#utils/auth";
import { getCache } from "#utils/cache";
import db from "#utils/database";

function initDB() {
  for (const t of ["announcement", "event", "information"]) {
    if (!db.includes("news", "timestamp", { type: t })) {
      db.push("news", "timestamp", { type: t, time: 0 });
    }
  }
}

function mysNewsTryToResetDB() {
  if (1 !== global.config.noticeMysNews) {
    db.set("news", "timestamp", []);
  }

  initDB();
}

async function mysNewsUpdate() {
  if (1 !== global.config.noticeMysNews) {
    return;
  }

  initDB();

  const ids = { announcement: 1, event: 2, information: 3 };
  const record = {};

  for (const t of Object.keys(ids)) {
    try {
      record[t] = await getMysNews(ids[t]);
    } catch (e) {
      // do nothing
    }
  }

  db.set("news", "data", record);
  return true;
}

async function mysNewsNotice(withImg = true) {
  if (1 !== global.config.noticeMysNews) {
    return;
  }

  initDB();

  const cacheDir = path.resolve(global.datadir, "image", "news");
  const data = db.get("news", "data");
  const silent = {};
  const news = [];

  for (const t of Object.keys(data)) {
    if (!lodash.hasIn(data[t], "data.list") || !Array.isArray(data[t].data.list)) {
      continue;
    }

    silent[t] = 0 === db.get("news", "timestamp", { type: t }).time;

    for (const n of lodash.sortBy(data[t].data.list, (c) => c.post.created_at)) {
      if (!lodash.hasIn(n, "post")) {
        continue;
      }

      const mkContent = (c) => ("。！？～~".split("").includes(c[c.length - 1]) ? c : `${c} ……`);
      const post = n.post || {};
      const { subject, content } = post;
      const image = post.images[0];
      const url = "string" === typeof post.post_id ? `https://bbs.mihoyo.com/ys/article/${post.post_id}` : "";
      const items = [
        "string" === typeof subject ? subject : "",
        "string" === typeof image ? image : "",
        "string" === typeof content ? mkContent(content) : "",
        url,
      ];
      const stamp = post.created_at || 0;
      const { time: timestamp } = db.get("news", "timestamp", { type: t });

      db.update("news", "timestamp", { type: t }, { time: Math.max(stamp, timestamp) });

      if (false === silent[t] && stamp > timestamp) {
        news.push(items);
      }
    }
  }

  for (const n of lodash.sortBy(news, (n) => n.stamp)) {
    let image64;

    if (true === withImg && "string" === typeof n[1] && "" !== n[1]) {
      try {
        image64 = await getCache(n[1], cacheDir, "base64");
      } catch (e) {
        // do nothing
      }
    }

    n[1] = undefined === image64 ? "" : `[CQ:image,type=image,file=base64://${image64}]`;

    const message = n.filter((c) => "string" === typeof c && "" !== c).join("\n");

    for (const bot of global.bots) {
      const ms = bot.boardcast(
        message,
        "group",
        (c) => false !== checkAuth({ sid: c.group_id }, global.innerAuthName.mysNews, false)
      );
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
}

export { mysNewsNotice, mysNewsTryToResetDB, mysNewsUpdate };
