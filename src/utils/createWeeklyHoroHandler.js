const scheduledHandler = require('./scheduledHandler');
const postWeeklyWalls = require('../post/postWeeklyWalls');

/**
 * @param stepNumber {number} 1 — 5 type groups, 2–3 — sign groups (6+6)
 */
const createWeeklyHoroHandler = function(stepNumber) {
  return scheduledHandler(async function() {
    console.log('post-weekly-horo step', stepNumber);
    await postWeeklyWalls(stepNumber);
  });
};

module.exports = createWeeklyHoroHandler;
