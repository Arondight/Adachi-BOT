import lodash from "lodash";
import fetch from "node-fetch";
import { imageOrc } from "./data.js";

// { "total_score": 700.4420866489831, "total_percent": "77.83", "main_score": 0,
//   "main_percent": "0.00", "sub_score": 700.4420866489831, "sub_percent": "77.83" }
async function doRating(msg) {
  const source = msg.text.match(/\[CQ:image,type=.*?,file=.+?\]/);
  const [url] = /(?<=url=).+(?=])/.exec(source) || [];
  const headers = {
    "Content-Type": "application/json",
  };
  let data, response, ret;
  const prop = await imageOrc(msg, url);

  if (undefined === prop) {
    return;
  }

  try {
    response = await fetch("https://api.genshin.pub/api/v1/relic/rate", {
      method: "POST",
      headers,
      body: JSON.stringify(prop),
    });

    ret = await response.json();
  } catch (e) {
    msg.bot.say(msg.sid, `圣遗物评分出错。`, msg.type, msg.uid, true);
    return;
  }

  if (400 === response.status) {
    if (lodash.hasIn(ret, "code") && 50003 === ret.code) {
      msg.bot.say(msg.sid, "您上传了正确的截图，但是 AI 未能识别，请重新截图。", msg.type, msg.uid, true);
    } else {
      msg.bot.say(msg.sid, `圣遗物评分出错。`, msg.type, msg.uid, true);
    }

    return;
  }

  if (200 === response.status || lodash.hasIn(ret, "total_percent")) {
    data = `您的${prop.pos}（${prop.main_item.name}）评分为 ${ret.total_percent} 分！\n==========`;
    prop.sub_item.forEach((item) => {
      data += `\n${item.name}：${item.value}`;
    });

    msg.bot.say(msg.sid, data, msg.type, msg.uid, false);
    return;
  }

  msg.bot.say(msg.sid, "发生了一个未知错误，请再试一次。", msg.type, msg.uid, true);
}

export { doRating };
