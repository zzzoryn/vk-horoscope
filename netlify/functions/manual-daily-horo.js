const scheduledHandler = require('../../src/utils/scheduledHandler');
const postDailyWalls = require('../../src/post/postDailyWalls');
const {DAILY_SLOT_COUNT} = postDailyWalls;

/**
 * Manual run — one post per call (keeps under function time limit).
 *   /.netlify/functions/manual-daily-horo?slot=0
 *
 * Slots: 0–4 collage part 1 (by type), 5–9 collage part 2, 10–21 sign groups.
 */
const handler = scheduledHandler(async function(event) {
  const slot = Number(event?.queryStringParameters?.slot);

  if (!Number.isInteger(slot) || slot < 0 || slot >= DAILY_SLOT_COUNT) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Query param slot is required (0–${DAILY_SLOT_COUNT - 1})`,
        example: '/.netlify/functions/manual-daily-horo?slot=0',
        slots: {
          '0-4': 'collage part 1 (common, business, love, health, erotic)',
          '5-9': 'collage part 2',
          '10-21': 'sign groups (aries … pisces)'
        }
      })
    };
  }

  console.log('manual-daily-horo slot', slot);
  const result = await postDailyWalls(slot);

  return {
    statusCode: 200,
    body: JSON.stringify({ok: true, slot, result})
  };
});

module.exports = {handler};
