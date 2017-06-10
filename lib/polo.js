const Promise = require('bluebird');
const Poloniex = require('poloniex-api-node');
const { key, secret } = require('./../secrets');
const { wait } = require('./util');

const poloniex = Promise.promisifyAll(new Poloniex(key, secret));

// polo functions
function getBtcRate(target) {
  const key = `BTC_${target}`;
  return poloniex.returnTickerAsync().then(res => res[key].last);
}

function getTargetBalance(target) {
  return poloniex.returnBalancesAsync().then(res => res[target]);
}

function getBtcBalance() {
  return getTargetBalance('BTC');
}

// buy some percent of current BTC holdings of a given target currency
async function pump(target) {
  const currencyPair = `BTC_${target}`;
  const rate = await getBtcRate(target);
  const balance = await getBtcBalance();
  const amount = balance / rate;

  return poloniex.buyAsync(currencyPair, rate, amount, null, null, null).tap(res => {
    console.log(`${target} pumped! ${amount} (${rate} BTC)`);
  });
}

// sell all target shares for that sweet sweet BTC
async function dump(target) {
  const currencyPair = `BTC_${target}`;
  const rate = await getBtcRate(target);
  const balance = await getTargetBalance(target);
  const amount = balance;

  return poloniex.sellAsync(currencyPair, rate, amount, null, null, null).tap(res => {
    console.log(`${target} dumped! ${amount} (${rate} BTC)`);
  });
}

async function watch(target, timeout = 250) {
  while (true) {
    const rate = await getBtcRate(target);
    console.log(rate);
    await wait(timeout);
  }
}

module.exports = {
  getBtcRate,
  getBtcBalance,
  getTargetBalance,
  pump,
  dump,
  watch,
};
