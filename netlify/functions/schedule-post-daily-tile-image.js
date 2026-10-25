const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postDailyTileSlot = require('../../src/post/postDailyTileSlot');
const {DAILY_TILE_SLOT_COUNT} = postDailyTileSlot;

/**
 * One tile per minute (sign × type). 60 slots — avoids Netlify ~30s timeout
 * that killed 5-tiles-per-sign runs (left logs stuck on "running").
 */
const handler = scheduledHandler(async function() {
  const slot = new Date().getUTCMinutes();

  if (slot >= DAILY_TILE_SLOT_COUNT) {
    return {skipped: true, reason: 'slot-out-of-range', slot};
  }

  console.log('schedule-post-daily-tile-image slot', slot);
  return await postDailyTileSlot(slot);
}, {name: 'schedule-post-daily-tile-image', minuteKey: true});

// After evening fetch (16:00), before posts (19:00). 17:00 UTC = 20:00 MSK.
exports.handler = schedule(
  '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59 17 * * *',
  handler
);
