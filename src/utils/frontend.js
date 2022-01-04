function decodeUriData(base64data) {
  return decodeURIComponent(
    atob(base64data)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

export { decodeUriData };