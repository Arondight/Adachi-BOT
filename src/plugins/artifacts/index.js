import lodash from "lodash";
import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { guessPossibleNames } from "../../utils/tools.js";
import { domainInfo } from "./data.js";
import { doArtifacts } from "./artifacts.js";
import { doStrengthen } from "./strengthen.js";
import { getText } from "./text.js";

async function Plugin(msg) {
  const text = getText(msg);
  const guess = guessPossibleNames(
    text,
    lodash
      .chain(global.artifacts.domains.alias)
      .toPairs()
      .flatten()
      .concat(Object.keys(global.artifacts.domains.name))
      .uniq()
      .value()
  );

  switch (true) {
    case hasEntrance(msg.text, "artifacts", "artifacts"):
      if ((undefined === text || guess.length > 0) && false !== checkAuth(msg, "artifacts")) {
        doArtifacts(msg, 1 === guess.length ? guess[0] : text);
      }
      break;
    case hasEntrance(msg.text, "artifacts", "strengthen"):
      if (false !== checkAuth(msg, "strengthen")) {
        doStrengthen(msg);
      }
      break;
    case hasEntrance(msg.text, "artifacts", "dungeons"):
      if (false !== checkAuth(msg, "dungeons")) {
        msg.bot.say(msg.sid, domainInfo(), msg.type, msg.uid, false, "\n");
      }
      break;
  }
}

export { Plugin as run };
