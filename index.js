const Promise = require('bluebird');
const { pump, dump, getBtcRate } = require('./lib/polo');
const { wait } = require('./lib/util');

const startingTimeout = 5000;
const intervalTimeout = 666;

async function hypeTrain(target, lossThreshold = 0) {
  const floorRate = await getBtcRate(target);
  let ceilingRate = floorRate;
  let firstChange = false;
  await pump(target);

  console.log('floor rate', floorRate);

  async function gainz(previousRate) {
    await wait(intervalTimeout);
    const currentRate = await getBtcRate(target);
    console.log('current rate', currentRate);
    if (currentRate > ceilingRate) ceilingRate = currentRate;

    if (currentRate <= floorRate - floorRate * lossThreshold && firstChange) {
      return dump(target, floorRate, currentRate, 'floor');
    }

    const gap = (ceilingRate - floorRate) * 0.1;
    if (
      currentRate > floorRate &&
      currentRate < ceilingRate - gap * (1 + lossThreshold) &&
      firstChange
    ) {
      return dump(target, floorRate, currentRate, 'dat gap doe');
    }

    console.log('HODL!');
    if (currentRate !== floorRate) firstChange = true;
    return gainz(currentRate);
  }

  await wait(startingTimeout);
  return gainz(floorRate);
}

// const target = process.argv[2];
// if (target) {
//   return hypeTrain(target, 0.1).then(() => console.log('done!')).catch(err => console.error(err));
// }
// console.log('need to specify a target currency (ex ETH)');

dump('NXC').then(() => console.log('done!')).catch(err => console.error(err));
