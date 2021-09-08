const { loadYML } = require("./load");

const names = loadYML("alias");

const alias = (text) => {
  if (text) {
    for (let name of Object.keys(names)) {
      for (let nickname of names[name]) {
        if (nickname == text) {
          return name;
        }
      }
    }
  }

  return text;
};

module.exports = {
  alias,
};
