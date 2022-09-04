import { doCard } from "#plugins/card/card";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

("use strict");

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "card", "card"):
      if (checkAuth(msg, "card")) {
        doCard(msg);
      }
      break;
  }
}

export { Plugin as run };
