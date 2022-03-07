import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";
import { doSave } from "./save.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "save", "save"):
      if (false !== checkAuth(msg, "save")) {
        doSave(msg);
      }
      break;
  }
}

export { Plugin as run };
