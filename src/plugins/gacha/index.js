import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doPool } from "./pool.js";
import { doGacha } from "./gacha.js";
import { doSelect, doSelectWhat, doSelectNothing } from "./select.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "gacha", "pool"):
      if (false !== (await checkAuth(msg, "pool"))) {
        await doPool(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "gacha"):
      if (false !== (await checkAuth(msg, "gacha"))) {
        await doGacha(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select-what"):
      if (false !== (await checkAuth(msg, "select-what"))) {
        await doSelectWhat(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select-nothing"):
      if (false !== (await checkAuth(msg, "select-nothing"))) {
        await doSelectNothing(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select"):
      if (false !== (await checkAuth(msg, "select"))) {
        await doSelect(msg);
      }
      break;
  }
}

export { Plugin as run };
