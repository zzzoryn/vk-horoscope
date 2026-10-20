const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postDailyWalls = require('../../src/post/postDailyWalls');
const {DAILY_SLOT_COUNT} = postDailyWalls;

/**
 * One collage/sign post per minute.
 * Slots 0–9 collage, 10–21 signs.
 * 19:xx primary, 20:xx repair (skip if already posted).
 */
const handler = scheduledHandler(async function() {
  const slot = new Date().getMinutes();

  if (slot >= DAILY_SLOT_COUNT) {
    return;
  }

  console.log('schedule-post-daily-horo slot', slot);
  await postDailyWalls(slot);
});

exports.handler = schedule(
  '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21 19,20 * * *',
  handler
);
