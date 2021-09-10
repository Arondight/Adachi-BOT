import { loadYML } from "./load.js";

const names = loadYML("alias");

function alias(text) {
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
}

export { alias };
