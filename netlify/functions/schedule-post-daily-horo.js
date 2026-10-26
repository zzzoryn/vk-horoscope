const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postDailyWalls = require('../../src/post/postDailyWalls');
const {DAILY_SLOT_COUNT} = postDailyWalls;

/**
 * One collage/sign post per minute.
 * Slots 0–9 collage, 10–21 signs.
 *
 * Only 19:xx UTC — a second "repair" hour (20:xx) duplicated posts when wall
 * dedupe missed. Missed slots: manual-daily-horo next calendar day (content_date).
 */
const handler = scheduledHandler(async function() {
  const slot = new Date().getUTCMinutes();

  if (slot >= DAILY_SLOT_COUNT) {
    return {skipped: true, reason: 'slot-out-of-range', slot};
  }

  console.log('schedule-post-daily-horo slot', slot);
  return await postDailyWalls(slot);
}, {name: 'schedule-post-daily-horo', minuteKey: true});

exports.handler = schedule(
  '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21 19 * * *',
  handler
);
