import db from "#utils/database";

("use strict");

function init(id) {
  if (!db.includes("artifact", "user", { msg: id })) {
    db.push("artifact", "user", { userID: id, initial: {}, fortified: {} });
  }
}

export { init };
