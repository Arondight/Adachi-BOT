import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { domainInfo } from "./data.js";
import { doArtifacts } from "./artifacts.js";
import { doStrengthen } from "./strengthen.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "artifacts", "artifacts"):
      if (false !== (await checkAuth(msg, "artifacts"))) {
        doArtifacts(msg);
      }
      break;
    case hasEntrance(msg.text, "artifacts", "strengthen"):
      if (false !== (await checkAuth(msg, "strengthen"))) {
        doStrengthen(msg);
      }
      break;
    case hasEntrance(msg.text, "artifacts", "dungeons"):
      if (false !== (await checkAuth(msg, "dungeons"))) {
        msg.bot.say(msg.sid, domainInfo(), msg.type, msg.uid, "\n");
      }
      break;
  }
}

export { Plugin as run };
