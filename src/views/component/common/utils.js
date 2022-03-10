function html(literals, ...placeholders) {
  let context = "";

  for (let i = 0; i < placeholders.length; ++i) {
    context += literals[i];
    context += placeholders[i].toString();
  }

  return context + literals[literals.length - 1];
}

function getParams(href) {
  const decodeURIComponentHelper = (encoded) =>
    decodeURIComponent(
      window
        .atob(encoded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

  return JSON.parse(decodeURIComponentHelper(new URL(href).searchParams.get("data")) || "{}");
}

function toReadableDate(date, format) {
  const items = {
    y: date.getFullYear(),
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
  };
  const pattern = `[^${Object.keys(items).join("")}]`;
  const regex = new RegExp(pattern, "g");

  Object.keys(items).forEach((c) => (items[c] = items[c].toString()));

  const adjust = (c) => {
    const str = items[c[0]] || "";
    return c.length < str.length ? str.slice(0 - c.length) : "0".repeat(c.length - str.length) + str;
  };
  const fields =
    format
      .split(regex)
      .filter((c) => "" !== c)
      .map((c) => adjust(c)) || [];
  const delimiters = format.match(regex) || [];
  let str = fields[0] || "";

  for (let i = 0; i < delimiters.length; ++i) {
    if (undefined !== fields[i + 1]) {
      str += delimiters[i] + fields[i + 1];
    }
  }

  return str;
}

export { getParams, html, toReadableDate };
