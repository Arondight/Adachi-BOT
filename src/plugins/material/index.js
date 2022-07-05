import { doMaterial, urls } from "#plugins/material/material";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "material", "material"):
      if (checkAuth(msg, "material")) {
        doMaterial(msg, urls.material);
      }
      break;
    case hasEntrance(msg.text, "material", "weekly"):
      if (checkAuth(msg, "weekly")) {
        doMaterial(msg, urls.weekly);
      }
      break;
    case hasEntrance(msg.text, "material", "talent"):
      if (checkAuth(msg, "talent")) {
        doMaterial(msg, urls.talent);
      }
      break;
    case hasEntrance(msg.text, "material", "weapon"):
      if (checkAuth(msg, "weapon")) {
        doMaterial(msg, urls.weapon);
      }
      break;
  }
}

export { Plugin as run };
