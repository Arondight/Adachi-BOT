import { render } from "../../utils/render.js";
import { getGachaResult } from "./data.js";
import { init } from "./init.js";

async function doGacha(msg) {
  await init(msg.uid);
  const data = await getGachaResult(msg.uid, msg.name);
  render(msg, data, "genshin-gacha");
}

export { doGacha };
