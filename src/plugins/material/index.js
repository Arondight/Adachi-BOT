import { doMaterial, url } from "#plugins/material/material";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

("use strict");

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "material", "material"):
      if (checkAuth(msg, "material")) {
        doMaterial(msg, url.material);
      }
      break;
    case hasEntrance(msg.text, "material", "weekly"):
      if (checkAuth(msg, "weekly")) {
        doMaterial(msg, url.weekly);
      }
      break;
    case hasEntrance(msg.text, "material", "talent"):
      if (checkAuth(msg, "talent")) {
        doMaterial(msg, url.talent);
      }
      break;
    case hasEntrance(msg.text, "material", "weapon"):
      if (checkAuth(msg, "weapon")) {
        doMaterial(msg, url.weapon);
      }
      break;
  }
}

export { Plugin as run };
