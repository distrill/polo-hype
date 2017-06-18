const Promise = require('bluebird');
const Poloniex = require('poloniex-api-node');
const { key, secret } = require('./../secrets');
const { wait } = require('./util');
const moment = require('moment');

const POLO_5_MIN = 300;
const POLO_15_MIN = 900;
const POLO_30_MIN = 1900;

const poloniex = Promise.promisifyAll(new Poloniex(key, secret));

function now() {
  return moment().format('X');
}

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

function getCurrencyPairs() {
  return poloniex.returnTickerAsync().then(ticker => Object.keys(ticker));
}

function attachSMA(periods, elem, index, array) {
  const start = index < periods ? index : index - periods;
  const n = index - start + 1;
  const sum = array.slice(start, index + 1).reduce((accum, { close }) => accum + close, 0);
  return Object.assign({}, elem, { sma: sum / n });
}

function debug(ticker, minutes = 6 * 60) {
  const periods = 50;
  const currencyPair = 'BTC_ETH';
  const start = moment().subtract(minutes, 'minutes').format('X');
  return poloniex
    .returnChartDataAsync(currencyPair, POLO_5_MIN, start, now()) // .then(cd => cd[0])
    .then(cd => cd.map(attachSMA.bind(null, periods)))
    .tap(cd => console.log(cd));
}

module.exports = {
  getBtcRate,
  getBtcBalance,
  getTargetBalance,
  pump,
  dump,
  watch,
  getCurrencyPairs,
  debug,
};
