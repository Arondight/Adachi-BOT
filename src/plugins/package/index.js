import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doPackage } from "./package.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "package", "package"):
      if (false !== checkAuth(msg, "package")) {
        doPackage(msg);
      }
      break;
  }
}

export { Plugin as run };
