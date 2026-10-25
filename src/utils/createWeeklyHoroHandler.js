const scheduledHandler = require('./scheduledHandler');
const postWeeklyWalls = require('../post/postWeeklyWalls');
const {WEEKLY_SLOT_COUNT} = postWeeklyWalls;

/**
 * Scheduled handler: post one weekly slot from current UTC minute.
 */
const createWeeklyHoroHandler = function() {
  return scheduledHandler(async function() {
    const slot = new Date().getUTCMinutes();

    if (slot >= WEEKLY_SLOT_COUNT) {
      return;
    }

    console.log('post-weekly-horo slot', slot);
    await postWeeklyWalls(slot);
  }, {name: 'schedule-post-weekly-horo', minuteKey: true});
};

module.exports = createWeeklyHoroHandler;
