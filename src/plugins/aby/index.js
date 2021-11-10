import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doAby } from "./aby.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "aby", "aby"):
      if (false !== checkAuth(msg, "aby")) {
        doAby(msg, 1);
      }
      break;
    case hasEntrance(msg.text, "aby", "lastaby"):
      if (false !== checkAuth(msg, "lastaby")) {
        doAby(msg, 2);
      }
      break;
  }
}

export { Plugin as run };
