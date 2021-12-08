import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doMaterial, urls } from "./material.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "material", "talent"):
      if (false !== checkAuth(msg, "talent")) {
        doMaterial(msg, urls.talent);
      }
      break;
    case hasEntrance(msg.text, "material", "weekly"):
      if (false !== checkAuth(msg, "weekly")) {
        doMaterial(msg, urls.weekly);
      }
      break;
  }
}

export { Plugin as run };
