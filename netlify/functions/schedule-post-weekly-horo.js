const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postWeeklyWalls = require('../../src/post/postWeeklyWalls');
const {WEEKLY_SLOT_COUNT} = postWeeklyWalls;

/**
 * One type/sign weekly post (+ pin) per minute.
 * Slots 0–4 type groups, 5–16 signs.
 *
 * Sunday only — Monday "repair" duplicated weekly posts (same issue as daily 20:xx).
 * Missed slots: manual-weekly-horo?slot=…
 */
const handler = scheduledHandler(async function() {
  const slot = new Date().getUTCMinutes();

  if (slot >= WEEKLY_SLOT_COUNT) {
    return {skipped: true, reason: 'slot-out-of-range', slot};
  }

  console.log('schedule-post-weekly-horo slot', slot);
  return await postWeeklyWalls(slot);
}, {name: 'schedule-post-weekly-horo', minuteKey: true});

exports.handler = schedule(
  '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 18 * * 0',
  handler
);
