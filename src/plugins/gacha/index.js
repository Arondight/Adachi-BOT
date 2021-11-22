/* global alias */
/* eslint no-undef: "error" */

import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { isPossibleName } from "../../utils/tools.js";
import { getName } from "./name.js";
import { doPool } from "./pool.js";
import { doGacha } from "./gacha.js";
import { doSelect, doSelectNothing, doSelectWhat } from "./select.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "gacha", "pool"):
      if (false !== checkAuth(msg, "pool")) {
        doPool(msg);
      }
      break;
    case hasEntrance(msg.text, "gacha", "gacha"):
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
      const names = Object.keys(alias.weaponNames);
      if (isPossibleName(name, names) && false !== checkAuth(msg, "select")) {
        doSelect(msg, name);
      }
      break;
    }
  }
}

export { Plugin as run };
