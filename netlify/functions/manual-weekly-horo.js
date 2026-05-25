const scheduledHandler = require('../../src/utils/scheduledHandler');
const postWeeklyWalls = require('../../src/post/postWeeklyWalls');

/**
 * Manual run. Examples:
 *   /.netlify/functions/manual-weekly-horo?step=1
 *
 * step 1 — 5 type groups (weekly summary + pin)
 * step 2 — sign groups 1–6
 * step 3 — sign groups 7–12
 */
const handler = scheduledHandler(async function(event) {
  const step = Number(event?.queryStringParameters?.step);

  if (!Number.isInteger(step) || step < 1 || step > 3) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Query param step is required (1–3)',
        example: '/.netlify/functions/manual-weekly-horo?step=1'
      })
    };
  }

  console.log('manual-weekly-horo step', step);

  await postWeeklyWalls(step);

  return {
    statusCode: 200,
    body: JSON.stringify({ok: true, step})
  };
});

module.exports = {handler};
