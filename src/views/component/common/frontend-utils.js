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

export { getParams, html };
