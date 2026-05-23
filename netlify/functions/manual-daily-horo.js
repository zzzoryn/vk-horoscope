const scheduledHandler = require('../../src/utils/scheduledHandler');
const postDailyWalls = require('../../src/post/postDailyWalls');

/**
 * Manual run. Examples:
 *   /.netlify/functions/manual-daily-horo?step=2
 *   /.netlify/functions/manual-daily-horo?step=1
 *
 * step 1 — collage part 1 (signs 1–6)
 * step 2 — collage part 2 (signs 7–12)
 * step 3 — sign group posts 1–6
 * step 4 — sign group posts 7–12
 */
const handler = scheduledHandler(async function(event) {
  const step = Number(event?.queryStringParameters?.step);

  if (!Number.isInteger(step) || step < 1 || step > 4) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Query param step is required (1–4)',
        example: '/.netlify/functions/manual-daily-horo?step=2'
      })
    };
  }

  console.log('manual-daily-horo step', step);

  await postDailyWalls(step);

  return {
    statusCode: 200,
    body: JSON.stringify({ok: true, step})
  };
});

module.exports = {handler};
