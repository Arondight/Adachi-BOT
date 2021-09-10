import _request from "request";
var module = {
  exports: {}
};
var exports = module.exports;
const request = _request;

exports.requests = options => {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  }).catch(error => {
    console.error(error);
  });
};

export let requests = exports.requests;
export default module.exports;