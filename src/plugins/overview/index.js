import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doInfo } from "./info.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "overview", "info"):
      if (false !== checkAuth(msg, "info")) {
        doInfo(msg);
      }
      break;
  }
}

export { Plugin as run };
