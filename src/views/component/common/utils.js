function html(literals, ...placeholders) {
  let context = "";

  for (let i = 0; i < placeholders.length; ++i) {
    context += literals[i];
    context += placeholders[i].toString();
  }

  return context + literals[literals.length - 1];
}

function decodeURIComponentHelper(encoded) {
  return decodeURIComponent(
    window
      .atob(encoded)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

function getParams(href) {
  return JSON.parse(decodeURIComponentHelper(new URL(href).searchParams.get("data")) || "{}");
}

function toReadableDate(date, format) {
  function adjust(c) {
    const str = items[c[0]] || "";

    return c.length < str.length ? str.slice(0 - c.length) : str.padStart(c.length, "0");
  }

  const items = {
    Y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    H: date.getHours(),
    M: date.getMinutes(),
    S: date.getSeconds(),
  };

  Object.keys(items).forEach((c) => (items[c] = items[c].toString()));

  const pattern = `[^${Object.keys(items).join("")}]`;
  const regex = new RegExp(pattern, "g");
  const fields =
    format
      .split(regex)
      .filter((c) => "" !== c)
      .map((c) => adjust(c)) || [];
  const delimiters = format.match(regex) || [];
  let str = fields[0] || "";

  for (let i = 0; i < delimiters.length; ++i) {
    if ("string" === typeof fields[i + 1]) {
      str += delimiters[i] + fields[i + 1];
    }
  }

  return str;
}

export { getParams, html, toReadableDate };
