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

export { getParams };
