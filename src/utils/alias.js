import { loadYML } from "./yaml.js";

const data = loadYML("alias");
const names = Object.entries(data).reduce((data, [k, v]) => {
  return v.forEach((c) => data.set(c, k)), data;
}, new Map());

function alias(text) {
  return names.has(text) ? names.get(text) : text;
}

export { alias };
