const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postWeeklyWalls = require('../../src/post/postWeeklyWalls');
const {WEEKLY_SLOT_COUNT} = postWeeklyWalls;

/**
 * One type/sign weekly post (+ pin) per minute.
 * Slots 0–4 type groups, 5–16 signs.
 * Sunday primary, Monday repair (skip if already posted).
 */
const handler = scheduledHandler(async function() {
  const slot = new Date().getMinutes();

  if (slot >= WEEKLY_SLOT_COUNT) {
    return;
  }

  console.log('schedule-post-weekly-horo slot', slot);
  await postWeeklyWalls(slot);
});

exports.handler = schedule(
  '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 18 * * 0,1',
  handler
);
