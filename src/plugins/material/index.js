import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { urls, doMaterial } from "./material.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "material", "weapon"):
      if (false !== (await checkAuth(msg, "weapon"))) {
        doMaterial(msg, urls.weapon);
      }
      break;
    case hasEntrance(msg.text, "material", "talent"):
      if (false !== (await checkAuth(msg, "talent"))) {
        doMaterial(msg, urls.talent);
      }
      break;
    case hasEntrance(msg.text, "material", "weekly"):
      if (false !== (await checkAuth(msg, "weekly"))) {
        doMaterial(msg, urls.weekly);
      }
      break;
  }
}

export { Plugin as run };
