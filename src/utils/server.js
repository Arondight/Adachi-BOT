const path = require("path");
const express = require("express");

const newServer = (port) => {
  const server = express();
  const workdir = path.resolve(__dirname, "..", "..");

  server.use(express.static(workdir));
  server.listen(port, "localhost");
};

module.exports = {
  newServer,
};
