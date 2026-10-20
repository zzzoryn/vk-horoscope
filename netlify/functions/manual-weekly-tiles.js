const scheduledHandler = require('../../src/utils/scheduledHandler');
const postTileImage = require('../../src/post/postTileImage');
const postWeeklyBgImage = require('../../src/post/postWeeklyBgImage');
const {TYPES, HOROSCOPES} = require('../../src/constants');

/**
 * Manual weekly tiles (not scheduled). Examples:
 *   /.netlify/functions/manual-weekly-tiles?sign=aries
 *   /.netlify/functions/manual-weekly-tiles?bg=love
 *   /.netlify/functions/manual-weekly-tiles?slot=0   (0–11 signs, 12–16 bg types)
 */
const handler = scheduledHandler(async function(event) {
  const params = event?.queryStringParameters || {};
  const sign = params.sign;
  const bg = params.bg;
  const slotRaw = params.slot;

  if (sign) {
    const horoscope = HOROSCOPES.find(item => item.name === sign);

    if (!horoscope) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Unknown sign: ${sign}`,
          valid: HOROSCOPES.map(item => item.name)
        })
      };
    }

    console.log('manual-weekly-tiles common', sign);
    await postTileImage.postTileImageWithRetry('common', sign, true);

    return {
      statusCode: 200,
      body: JSON.stringify({ok: true, kind: 'sign', sign})
    };
  }

  if (bg) {
    const type = TYPES.find(item => item.name === bg);

    if (!type) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Unknown bg type: ${bg}`,
          valid: TYPES.map(item => item.name)
        })
      };
    }

    console.log('manual-weekly-tiles bg', bg);
    await postWeeklyBgImage(bg);

    return {
      statusCode: 200,
      body: JSON.stringify({ok: true, kind: 'bg', bg})
    };
  }

  if (slotRaw != null && slotRaw !== '') {
    const slot = Number(slotRaw);

    if (!Number.isInteger(slot) || slot < 0 || slot > 16) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'slot must be 0–16 (0–11 signs, 12–16 bg)',
          example: '/.netlify/functions/manual-weekly-tiles?slot=0'
        })
      };
    }

    if (slot < 12) {
      const name = HOROSCOPES[slot].name;
      console.log('manual-weekly-tiles slot sign', slot, name);
      await postTileImage.postTileImageWithRetry('common', name, true);

      return {
        statusCode: 200,
        body: JSON.stringify({ok: true, kind: 'sign', slot, sign: name})
      };
    }

    const type = TYPES[slot - 12].name;
    console.log('manual-weekly-tiles slot bg', slot, type);
    await postWeeklyBgImage(type);

    return {
      statusCode: 200,
      body: JSON.stringify({ok: true, kind: 'bg', slot, bg: type})
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      error: 'Pass sign, bg, or slot',
      examples: [
        '/.netlify/functions/manual-weekly-tiles?sign=aries',
        '/.netlify/functions/manual-weekly-tiles?bg=love',
        '/.netlify/functions/manual-weekly-tiles?slot=12'
      ],
      signs: HOROSCOPES.map(item => item.name),
      bgTypes: TYPES.map(item => item.name)
    })
  };
});

module.exports = {handler};
