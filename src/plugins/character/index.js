/* global alias */
/* eslint no-undef: "error" */

import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { isPossibleName } from "../../utils/tools.js";
import { doCharacter } from "./character.js";
import { getName } from "./name.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "character", "character"): {
      const name = getName(msg.text);
      const names = Object.keys(alias.characterNames);
      if (isPossibleName(name, names) && false !== checkAuth(msg, "character")) {
        doCharacter(msg, name, true);
      }
      break;
    }
    case hasEntrance(msg.text, "character", "others_character"): {
      const name = getName(msg.text);
      if (false !== checkAuth(msg, "others_character")) {
        doCharacter(msg, name);
      }
      break;
    }
  }
}

export { Plugin as run };
