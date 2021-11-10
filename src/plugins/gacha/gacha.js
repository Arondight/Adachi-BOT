import { render } from "../../utils/render.js";
import { getGachaResult } from "./data.js";
import { init } from "./init.js";

function doGacha(msg) {
  init(msg.uid);
  const data = getGachaResult(msg.uid, msg.name);
  render(msg, data, "genshin-gacha");
}

export { doGacha };
