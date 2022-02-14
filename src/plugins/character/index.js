import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";
import { guessPossibleNames } from "#utils/tools";
import { doCharacter } from "./character.js";
import { getName } from "./name.js";

async function Plugin(msg) {
  const name = getName(msg.text);
  const guess = guessPossibleNames(name, global.names.character);

  switch (true) {
    case hasEntrance(msg.text, "character", "character"):
      if (guess.length > 0 && false !== checkAuth(msg, "character")) {
        doCharacter(msg, 1 === guess.length ? guess[0] : name, true, guess);
      }
      break;
    case hasEntrance(msg.text, "character", "others_character"):
      if (guess.length > 0 && false !== checkAuth(msg, "others_character")) {
        doCharacter(msg, 1 === guess.length ? guess[0] : name, false, guess);
      }
      break;
  }
}

export { Plugin as run };
