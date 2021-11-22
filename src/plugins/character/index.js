/* global alias */
/* eslint no-undef: "error" */

import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { guessPossibleNames, isPossibleName } from "../../utils/tools.js";
import { doCharacter } from "./character.js";
import { getName } from "./name.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "character", "character"): {
      const name = getName(msg.text);
      if (
        isPossibleName(name, Object.values(alias.characterNames)) &&
        guessPossibleNames(name, Object.keys(alias.characterNames)).length > 0 &&
        false !== checkAuth(msg, "character")
      ) {
        doCharacter(msg, true, name);
      }
      break;
    }
    case hasEntrance(msg.text, "character", "others_character"):
      if (false !== checkAuth(msg, "others_character")) {
        doCharacter(msg, false);
      }
      break;
  }
}

export { Plugin as run };
