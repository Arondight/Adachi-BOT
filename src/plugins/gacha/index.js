import { doGacha } from "#plugins/gacha/gacha";
import { getName, getPool } from "#plugins/gacha/name";
import { doPool } from "#plugins/gacha/pool";
import { doSelect, doSelectNothing, doSelectWhat } from "#plugins/gacha/select";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";
import { guessPossibleNames } from "#utils/tools";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "gacha", "pool"): {
      const name = getPool(msg);
      const guess = guessPossibleNames(name, Object.values(global.command.functions.options.pool)).flat();
      if ((undefined === name || guess.length > 0) && false !== checkAuth(msg, "pool")) {
        doPool(msg, 1 === guess.length ? guess[0] : name);
      }
      break;
    }
    case hasEntrance(msg.text, "gacha", "gacha"):
      if (false !== checkAuth(msg, "gacha")) {
        const times = parseInt((msg.text.match(/[0-9]+/g) || [10])[0]);
        doGacha(msg, [10, 180, times].sort((a, b) => a - b)[1]);
      }
      break;
    case hasEntrance(msg.text, "gacha", "gacha10"):
      if (false !== checkAuth(msg, "gacha")) {
        doGacha(msg, 10);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select-what"):
      if (false !== checkAuth(msg, "select-what")) {
        doSelectWhat(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select-nothing"):
      if (false !== checkAuth(msg, "select-nothing")) {
        doSelectNothing(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "select"): {
      const name = getName(msg);
      const guess = name ? guessPossibleNames(name, global.names.weapon) : "null";
      if (guess.length > 0 && false !== checkAuth(msg, "select")) {
        doSelect(msg, name && (1 === guess.length ? guess[0] : name));
      }
      break;
    }
  }
}

export { Plugin as run };
