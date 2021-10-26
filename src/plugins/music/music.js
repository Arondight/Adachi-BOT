/* global all */
/* eslint no-undef: "error" */

import lodash from "lodash";
import fetch from "node-fetch";
import querystring from "querystring";
import db from "../../utils/database.js";

const ERRCODE = {
  ERR_SRC: "1",
  ERR_404: "2",
  ERR_API: "3",
};
Object.freeze(ERRCODE);

const errMsg = {
  [ERRCODE.ERR_SRC]: "错误的音乐源",
  [ERRCODE.ERR_404]: "没有查询到对应歌曲",
  [ERRCODE.ERR_API]: "歌曲查询出错",
};

async function musicQQ(keyword) {
  const url = "https://api.qq.jsososo.com/search/quick";
  const form = { key: keyword };
  const body = querystring.stringify(form);
  const headers = {
    "Content-Length": body.length,
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
  let jbody = undefined;

  if (200 === response.status) {
    jbody = await response.json();
  }

  if (!jbody) {
    return ERRCODE.ERR_API;
  }

  if (lodash.hasIn(jbody, ["data", "song", "itemlist", 0, "id"])) {
    return [
      {
        type: "music",
        data: {
          type: "qq",
          id: jbody.data.song.itemlist[0].id,
        },
      },
    ];
  }

  return ERRCODE.ERR_404;
}

async function music163(keyword) {
  const url = "https://music.163.com/api/search/get/";
  const form = {
    s: keyword,
    // 1:单曲、 10:专辑、 100:歌手、 1000:歌单、 1002:用户、 1004:MV、 1006:歌词、 1009:电台、 1014:视频
    type: 1,
    limit: 1,
    offset: 0,
  };
  const body = querystring.stringify(form);
  const headers = {
    "Content-Length": body.length,
    "Content-Type": "application/x-www-form-urlencoded",
    Referer: "https://music.163.com",
    Cookie: "appver=2.0.2",
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });
  let jbody = undefined;

  if (200 === response.status) {
    jbody = await response.json();
  }

  if (!jbody) {
    return ERRCODE.ERR_API;
  }

  if (lodash.hasIn(jbody, ["result", "songs", 0, "id"])) {
    return [
      {
        type: "music",
        data: {
          type: "163",
          id: jbody.result.songs[0].id,
        },
      },
    ];
  }

  return ERRCODE.ERR_404;
}

async function musicID(msg, source) {
  const [keyword] = msg.split(/(?<=^\S+)\s/).slice(1);
  const worker = {
    [all.functions.options.music_source.qq || "qq"]: musicQQ,
    [all.functions.options.music_source[163] || "163"]: music163,
  };

  if (!(source in worker)) {
    return ERRCODE.ERR_SRC;
  }

  return await worker[source](keyword);
}

async function musicSrc(msg, id) {
  let [source] = msg.split(/(?<=^\S+)\s/).slice(1);
  const data = await db.get("music", "source", { ID: id });

  if ("string" === typeof source) {
    source = source.toLowerCase();

    if (!Object.values(all.functions.options.music_source).includes(source)) {
      return false;
    }

    if (undefined === data) {
      await db.push("music", "source", {
        ID: id,
        Source: source,
      });
    } else {
      await db.update(
        "music",
        "source",
        { ID: id },
        { ...data, Source: source }
      );
    }
  }

  return source;
}

export { errMsg, musicID, musicSrc };
