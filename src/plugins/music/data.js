import lodash from "lodash";
import fetch from "node-fetch";
import querystring from "querystring";
import db from "#utils/database";
import { filterWordsByRegex, getWordByRegex } from "#utils/tools";

const m_ERR_CODE = Object.freeze({
  ERR_SRC: "1",
  ERR_404: "2",
  ERR_API: "3",
});

const m_ERR_MSG = Object.freeze({
  [m_ERR_CODE.ERR_SRC]: "错误的音乐源",
  [m_ERR_CODE.ERR_404]: "没有查询到对应歌曲",
  [m_ERR_CODE.ERR_API]: "歌曲查询出错",
});

async function musicQQ(keyword) {
  const url = "https://c.y.qq.com/soso/fcgi-bin/client_search_cp";
  const query = { w: keyword };
  const headers = {
    "Content-Type": "application/x-javascript;charset=utf-8",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  };
  let response;
  let jbody;

  try {
    response = await fetch(`${url}?${new URLSearchParams(query)}`, { method: "GET", headers });

    if (200 === response.status) {
      jbody = await response.text();
    }
  } catch (e) {
    // do nothing
  }

  if (undefined === jbody) {
    return m_ERR_CODE.ERR_API;
  }

  try {
    // callback({"code":0,"data":{})
    const starti = "callback(".length;
    jbody = JSON.parse(jbody.substring(starti, jbody.length - 1));
  } catch (e) {
    return m_ERR_CODE.ERR_API;
  }

  if (lodash.hasIn(jbody, "data.song.list[0].songid")) {
    return { type: "qq", id: jbody.data.song.list[0].songid };
  }

  return m_ERR_CODE.ERR_404;
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
  let response;
  let jbody;

  try {
    response = await fetch(url, { method: "POST", headers, body });

    if (200 === response.status) {
      jbody = await response.json();
    }
  } catch (e) {
    // do nothing
  }

  if (undefined === jbody) {
    return m_ERR_CODE.ERR_API;
  }

  if (lodash.hasIn(jbody, "result.songs[0].id")) {
    return { type: "163", id: jbody.result.songs[0].id };
  }

  return m_ERR_CODE.ERR_404;
}

async function musicID(text, source) {
  const args = filterWordsByRegex(text, ...global.command.functions.entrance.music);
  const worker = {
    [global.all.functions.options.music_source.qq || "qq"]: musicQQ,
    [global.all.functions.options.music_source[163] || "163"]: music163,
  };

  if (!(source in worker)) {
    return m_ERR_CODE.ERR_SRC;
  }

  return await worker[source](args);
}

function musicSrc(text, id) {
  let [source] = getWordByRegex(filterWordsByRegex(text, ...global.command.functions.entrance.music_source), /\S+/);
  const data = db.get("music", "source", { ID: id });

  if ("string" === typeof source) {
    source = source.toLowerCase();

    if (!Object.values(global.all.functions.options.music_source).includes(source)) {
      return false;
    }

    if (undefined === data) {
      db.push("music", "source", { ID: id, Source: source });
    } else {
      db.update("music", "source", { ID: id }, { ...data, Source: source });
    }
  }

  return source;
}

export { m_ERR_MSG as errMsg, musicID, musicSrc };
