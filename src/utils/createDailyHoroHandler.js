const scheduledHandler = require('./scheduledHandler');
const postDailyWalls = require('../post/postDailyWalls');

/**
 * @param stepNumber {number} 1–4 (collage 1, collage 2, signs 1–6, signs 7–12)
 */
const createDailyHoroHandler = function(stepNumber) {
  return scheduledHandler(async function() {
    console.log('post-daily-horo step', stepNumber);
    await postDailyWalls(stepNumber);
  });
};

module.exports = createDailyHoroHandler;
