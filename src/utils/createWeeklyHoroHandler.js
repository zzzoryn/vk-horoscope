const scheduledHandler = require('./scheduledHandler');
const postWeeklyWalls = require('../post/postWeeklyWalls');
const {WEEKLY_SLOT_COUNT} = postWeeklyWalls;

/**
 * Scheduled handler: post one weekly slot from current UTC minute.
 */
const createWeeklyHoroHandler = function() {
  return scheduledHandler(async function() {
    const slot = new Date().getMinutes();

    if (slot >= WEEKLY_SLOT_COUNT) {
      return;
    }

    console.log('post-weekly-horo slot', slot);
    await postWeeklyWalls(slot);
  });
};

module.exports = createWeeklyHoroHandler;
