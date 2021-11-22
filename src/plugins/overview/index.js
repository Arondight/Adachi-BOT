/* global alias */
/* eslint no-undef: "error" */

import { checkAuth } from "../../utils/auth.js";
import { hasEntrance } from "../../utils/config.js";
import { isPossibleName } from "../../utils/tools.js";
import { getName } from "./name.js";
import { doInfo } from "./info.js";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "overview", "info"): {
      const name = getName(msg.text);
      if (isPossibleName(name, Object.values(alias.allNames)) && false !== checkAuth(msg, "info")) {
        doInfo(msg);
      }
      break;
    }
  }
}

export { Plugin as run };
