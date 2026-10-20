const scheduledHandler = require('../../src/utils/scheduledHandler');
const postWeeklyWalls = require('../../src/post/postWeeklyWalls');
const {WEEKLY_SLOT_COUNT} = postWeeklyWalls;

/**
 * Manual run — one post (+ pin) per call.
 *   /.netlify/functions/manual-weekly-horo?slot=0
 *
 * Slots: 0–4 type groups, 5–16 sign groups.
 */
const handler = scheduledHandler(async function(event) {
  const slot = Number(event?.queryStringParameters?.slot);

  if (!Number.isInteger(slot) || slot < 0 || slot >= WEEKLY_SLOT_COUNT) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Query param slot is required (0–${WEEKLY_SLOT_COUNT - 1})`,
        example: '/.netlify/functions/manual-weekly-horo?slot=0',
        slots: {
          '0-4': 'type groups (common, business, love, health, erotic)',
          '5-16': 'sign groups (aries … pisces)'
        }
      })
    };
  }

  console.log('manual-weekly-horo slot', slot);
  const result = await postWeeklyWalls(slot);

  return {
    statusCode: 200,
    body: JSON.stringify({ok: true, slot, result})
  };
});

module.exports = {handler};
