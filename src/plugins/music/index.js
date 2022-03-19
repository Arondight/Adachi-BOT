import { doMusic, doMusicSource } from "#plugins/music/music";
import { checkAuth } from "#utils/auth";
import { hasEntrance } from "#utils/config";

async function Plugin(msg) {
  switch (true) {
    case hasEntrance(msg.text, "music", "music"):
      if (false !== checkAuth(msg, "music")) {
        doMusic(msg);
      }
      break;
    case hasEntrance(msg.text, "music", "music_source"):
      if (false !== checkAuth(msg, "music_source")) {
        doMusicSource(msg);
      }
      break;
  }
}

export { Plugin as run };
