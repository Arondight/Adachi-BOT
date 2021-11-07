import db from "../../utils/database.js";

async function init(id) {
  if (!(await db.includes("artifact", "user", "msg", id))) {
    await db.push("artifact", "user", { userID: id, initial: {}, fortified: {} });
  }
}

export { init };
