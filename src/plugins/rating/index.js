import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { doRating } from "./rating.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "rating", "rating"):
      if (false !== checkAuth(msg, "rating")) {
        doRating(msg);
      }
      break;
  }
}

export { Plugin as run };
