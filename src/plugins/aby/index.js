import { doAby } from "#plugins/aby/aby";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "aby", "aby"):
      if (checkAuth(msg, "aby")) {
        doAby(msg, 1);
      }
      break;
    case hasEntrance(msg.text, "aby", "lastaby"):
      if (checkAuth(msg, "lastaby")) {
        doAby(msg, 2);
      }
      break;
  }
}

export { Plugin as run };
