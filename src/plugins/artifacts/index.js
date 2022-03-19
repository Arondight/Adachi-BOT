import lodash from "lodash";
import { doArtifacts } from "#plugins/artifacts/artifacts";
import { domainInfo } from "#plugins/artifacts/data";
import { doStrengthen } from "#plugins/artifacts/strengthen";
import { getText } from "#plugins/artifacts/text";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";
import { guessPossibleNames } from "#utils/tools";

async function Plugin(msg) {
  const text = getText(msg);
  const guess = guessPossibleNames(
    text,
    lodash
      .chain(Object.assign({}, global.artifacts.domains.alias, global.artifacts.domains.name))
      .toPairs()
      .flatten()
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
