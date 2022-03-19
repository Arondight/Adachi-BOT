import { doRating, doRating2 } from "#plugins/rating/rating";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "rating", "rating"): {
      const handler = {
        "total score": doRating,
        "number of attributes": doRating2,
      };

      if (false !== checkAuth(msg, "rating")) {
        handler["number of attributes"](msg);
      }
      break;
    }
  }
}

export { Plugin as run };
