const scheduledHandler = require('../../src/utils/scheduledHandler');
const postDailyTilesForSign = require('../../src/post/postDailyTilesForSign');
const {HOROSCOPES} = require('../../src/constants');

/**
 * Manual run (not scheduled). Examples:
 *   /.netlify/functions/manual-daily-tiles?sign=aries
 *   /.netlify/functions/manual-daily-tiles?sign=libra
 *
 * Netlify UI "Invoke" without query runs aries (first sign).
 */
const handler = scheduledHandler(async function(event) {
  const sign = event?.queryStringParameters?.sign || 'aries';
  const horoscope = HOROSCOPES.filter(item => item.name === sign)[0];

  if (!horoscope) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Unknown sign: ${sign}`,
        valid: HOROSCOPES.map(item => item.name)
      })
    };
  }

  console.log('manual-daily-tiles sign', sign);

  await postDailyTilesForSign(sign);

  return {
    statusCode: 200,
    body: JSON.stringify({ok: true, sign})
  };
});

module.exports = {handler};
