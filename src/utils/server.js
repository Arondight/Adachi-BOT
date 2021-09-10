import _express from "express";
import _path from "path";
var module = {
  exports: {}
};
var exports = module.exports;
const path = _path;
const express = _express;

const newServer = port => {
  const server = express();
  const workdir = path.resolve(__dirname, "..", "..");
  server.use(express.static(workdir));
  server.listen(port, "localhost");
};

module.exports = {
  newServer
};
export default module.exports;