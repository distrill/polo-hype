const Promise = require('bluebird');
const { pump, dump, watch } = require('./polo');

const helpText = `
Usage:
    node lib/tools [command]
Available Commands:
    pump [target]                     buy as much target as possible (whatever current rate is)
    dump [target]                     sell all of target (whatever current rate is)
    watch [target] [interval=250]     watch the price of target, print every interval ms
`;

function run() {
  const command = process.argv[2];
  const target = process.argv[3];
  switch (command) {
    case 'pump':
      return pump(target);
    case 'dump':
      return dump(target);
    case 'watch':
      return watch(target, process.argv[4]);
    default:
      return Promise.resolve(console.log(helpText));
  }
}

run().catch(console.error);
