const {HOROSCOPES} = require('../constants');
const {isTileFresh} = require('./tileFreshness');
const postTileImage = require('./postTileImage');

/**
 * @param vk
 * @param rows
 * @return {Promise<object[]>}
 */
const ensureWeeklyTiles = async function(vk, rows) {
  const expectedDate = rows[0].date;
  const failed = [];

  for (let index = 0; index < HOROSCOPES.length; index++) {
    const horoscope = HOROSCOPES[index];

    if (isTileFresh(rows[index], 'common', expectedDate)) {
      continue;
    }

    try {
      await postTileImage.postTileImageWithRetry('common', horoscope.name, true, {vk, rows});
      console.log(`ensureWeeklyTiles: regenerated common/${horoscope.name}`);
    } catch (error) {
      console.error(`ensureWeeklyTiles: failed common/${horoscope.name}`, error);
      failed.push({type: 'common', sign: horoscope.name, error: error.message});
    }
  }

  return failed;
};

module.exports = ensureWeeklyTiles;
