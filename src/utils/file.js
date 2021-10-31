/* global rootdir */
/* eslint no-undef: "error" */

import fs from "fs";
import url from "url";
import path from "path";

function readlink(filepath) {
  if (!path.isAbsolute(filepath)) {
    return path.resolve(rootdir, filepath);
  }

  return filepath;
}

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
}

function ls(dir, buffer) {
  dir = readlink(dir);
  buffer = buffer || [];

  if (!fs.existsSync(dir)) {
    return [];
  }

  (fs.readdirSync(dir) || []).forEach((file) => {
    if (fs.statSync(path.resolve(dir, file)).isDirectory()) {
      buffer = ls(path.resolve(dir, file), buffer);
    } else {
      buffer.push(path.resolve(dir, file));
    }
  });

  return buffer;
}

function du(filepath) {
  let size = 0;

  filepath = readlink(filepath);

  if (fs.lstatSync(filepath).isDirectory()) {
    (ls(filepath) || []).forEach((file) => {
      size += fs.statSync(file).size;
    });
  } else {
    size += fs.statSync(filepath).size;
  }

  return size;
}

export { readlink, mkdir, ls, du };
