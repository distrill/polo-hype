const Promise = require('bluebird');
const Poloniex = require('poloniex-api-node');
const { key, secret } = require('./../secrets');
const { wait } = require('./util');
const moment = require('moment');

const poloIntervals = { fiveMin: 300, fifteenMin: 900, thirtyMin: 1900 };
const periods = { sma: 50, ema: 30 };

const poloniex = Promise.promisifyAll(new Poloniex(key, secret));

function now() {
  return moment().format('X');
}

// polo functions
function getBtcRate(target) {
  const currencyPair = `BTC_${target}`;
  return poloniex.returnTickerAsync().then(res => res[currencyPair].last);
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

  return poloniex.buyAsync(currencyPair, rate, amount, null, null, null).tap(() => {
    console.log(`${target} pumped! ${amount} (${rate} BTC)`);
  });
}

// sell all target shares for that sweet sweet BTC
async function dump(target) {
  const currencyPair = `BTC_${target}`;
  const rate = await getBtcRate(target);
  const balance = await getTargetBalance(target);
  const amount = balance;

  return poloniex.sellAsync(currencyPair, rate, amount, null, null, null).tap(() => {
    console.log(`${target} dumped! ${amount} (${rate} BTC)`);
  });
}

async function watch(target, timeout = 250) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rate = await getBtcRate(target);
    console.log(rate);
    await wait(timeout);
  }
}

function getCurrencyPairs() {
  return poloniex.returnTickerAsync().then(ticker => Object.keys(ticker));
}

function attachSMA(chartData) {
  return chartData.map((elem, index, array) => {
    const start = index < periods.sma ? index : index - periods.sma;
    const n = index - start + 1;
    const sum = array.slice(start, index + 1).reduce((accum, { close }) => accum + close, 0);
    return Object.assign({}, elem, { sma: sum / n });
  });
}

function attachEMA(chartData) {
  const multiplier = 2 / (periods.ema + 1);
  return chartData.reduce((accum, elem) => {
    const { close } = elem;
    let ema;
    if (accum && accum.length > 0) {
      const previousEMA = accum[accum.length - 1].ema;
      ema = (close - previousEMA) * multiplier + previousEMA;
    } else {
      ema = close;
    }
    return [...accum, Object.assign({}, elem, { ema })];
  }, []);
}

function getChartData(currencyPair, minutes = 6 * 60) {
  const start = moment().subtract(minutes, 'minutes').format('X');
  return poloniex
    .returnChartDataAsync(currencyPair, poloIntervals.fiveMin, start, now())
    .then(attachSMA)
    .then(attachEMA)
    .tap(console.log);
}

module.exports = {
  getBtcRate,
  getBtcBalance,
  getTargetBalance,
  pump,
  dump,
  watch,
  getCurrencyPairs,
  getChartData,
};
