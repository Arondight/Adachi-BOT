import { doMaterial, urls } from "#plugins/material/material";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "material", "material"):
      if (false !== checkAuth(msg, "material")) {
        doMaterial(msg, urls.material);
      }
      break;
    case hasEntrance(msg.text, "material", "weekly"):
      if (false !== checkAuth(msg, "weekly")) {
        doMaterial(msg, urls.weekly);
      }
      break;
    case hasEntrance(msg.text, "material", "talent"):
      if (false !== checkAuth(msg, "talent")) {
        doMaterial(msg, urls.talent);
      }
      break;
    case hasEntrance(msg.text, "material", "weapon"):
      if (false !== checkAuth(msg, "weapon")) {
        doMaterial(msg, urls.weapon);
      }
      break;
  }
}

export { Plugin as run };
