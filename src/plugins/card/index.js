import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doCard } from "./card.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "card", "card"):
      if (false !== checkAuth(msg, "card")) {
        doCard(msg);
      }
      break;
  }
}

export { Plugin as run };
