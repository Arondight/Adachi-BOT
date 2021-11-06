import { hasEntrance } from "../../utils/config.js";
import { doSave } from "./save.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "save", "save"):
      await doSave(msg, "save");
      break;
    case hasEntrance(msg.text, "save", "change"):
      await doSave(msg, "change");
      break;
  }
}

export { Plugin as run };
