import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doSave } from "./save.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "save", "save"):
      if (false !== checkAuth(msg, "save")) {
        doSave(msg, "save");
      }
      break;
    case hasEntrance(msg.text, "save", "change"):
      if (false !== checkAuth(msg, "change")) {
        doSave(msg, "change");
      }
      break;
  }
}

export { Plugin as run };
