import { render } from "../../utils/render.js";
import { gachaTimes } from "./data.js";
import { init } from "./init.js";

function doGacha(msg, times = 10) {
  init(msg.uid);
  render(msg, gachaTimes(msg.uid, msg.name, times), "genshin-gacha");
}

export { doGacha };
