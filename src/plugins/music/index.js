import { doMusic, doMusicSource } from "#plugins/music/music";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

("use strict");

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "music", "music"):
      if (checkAuth(msg, "music")) {
        doMusic(msg);
      }
      break;
    case hasEntrance(msg.text, "music", "music_source"):
      if (checkAuth(msg, "music_source")) {
        doMusicSource(msg);
      }
      break;
  }
}

export { Plugin as run };
