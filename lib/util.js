const Promise = require('bluebird');

function wait(t) {
  return new Promise(resolve => {
    setTimeout(resolve, t);
  });
}

module.exports = { wait };
