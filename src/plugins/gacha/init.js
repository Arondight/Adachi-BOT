import db from "../../utils/database.js";

function init(uid) {
  if (!db.includes("gacha", "user", "userID", uid)) {
    db.push("gacha", "user", {
      userID: uid,
      choice: 301,
      indefinite: { five: 1, four: 1, isUp: undefined },
      character: { five: 1, four: 1, isUp: 0 },
      weapon: { five: 1, four: 1, isUp: null },
      path: { course: null, fate: 0 },
    });
  }
}

export { init };
