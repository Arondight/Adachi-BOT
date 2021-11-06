import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doCharacter } from "./character.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "character", "character"):
      if (false !== (await checkAuth(msg, "character"))) {
        await doCharacter(msg, true);
      }
      break;
    case hasEntrance(msg.text, "character", "others_character"):
      if (false !== (await checkAuth(msg, "others_character"))) {
        await doCharacter(msg, false);
      }
      break;
  }
}

export { Plugin as run };
