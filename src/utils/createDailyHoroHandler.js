const scheduledHandler = require('./scheduledHandler');
const postDailyWalls = require('../post/postDailyWalls');
const {DAILY_SLOT_COUNT} = postDailyWalls;

/**
 * Scheduled handler: post one daily slot from current UTC minute.
 */
const createDailyHoroHandler = function() {
  return scheduledHandler(async function() {
    const slot = new Date().getUTCMinutes();

    if (slot >= DAILY_SLOT_COUNT) {
      return;
    }

    console.log('post-daily-horo slot', slot);
    await postDailyWalls(slot);
  }, {name: 'schedule-post-daily-horo', minuteKey: true});
};

module.exports = createDailyHoroHandler;
