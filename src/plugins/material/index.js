import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { urls, doMaterial } from "./material.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "material", "weapon"):
      if (false !== (await checkAuth(msg, "weapon"))) {
        await doMaterial(msg, urls.weapon);
      }
      break;
    case hasEntrance(msg.text, "material", "talent"):
      if (false !== (await checkAuth(msg, "talent"))) {
        await doMaterial(msg, urls.talent);
      }
      break;
    case hasEntrance(msg.text, "material", "weekly"):
      if (false !== (await checkAuth(msg, "weekly"))) {
        await doMaterial(msg, urls.weekly);
      }
      break;
  }
}

export { Plugin as run };
