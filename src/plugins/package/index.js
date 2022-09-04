import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";
import { doPackage } from "./package.js";

("use strict");

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "package", "package"):
      if (checkAuth(msg, "package")) {
        doPackage(msg);
      }
      break;
  }
}

export { Plugin as run };
