const {HOROSCOPES} = require('../constants');
const {isTileFresh} = require('./tileFreshness');
const postTileImage = require('./postTileImage');

const MAX_REGENERATIONS = 10;

/**
 * @param vk
 * @param rows
 * @return {Promise<object[]>}
 */
const ensureWeeklyTiles = async function(vk, rows) {
  const expectedDate = rows[0].date;
  const failed = [];
  const skipped = [];
  let regenerated = 0;

  for (let index = 0; index < HOROSCOPES.length; index++) {
    const horoscope = HOROSCOPES[index];

    if (isTileFresh(rows[index], 'common', expectedDate)) {
      continue;
    }

    if (regenerated >= MAX_REGENERATIONS) {
      skipped.push({type: 'common', sign: horoscope.name});
      continue;
    }

    try {
      await postTileImage.postTileImageWithRetry('common', horoscope.name, true, {vk, rows});
      regenerated++;
      console.log(`ensureWeeklyTiles: regenerated common/${horoscope.name}`);
    } catch (error) {
      console.error(`ensureWeeklyTiles: failed common/${horoscope.name}`, error);
      failed.push({type: 'common', sign: horoscope.name, error: error.message});
    }
  }

  if (skipped.length) {
    console.warn(`ensureWeeklyTiles: cap ${MAX_REGENERATIONS} reached, skipped`, skipped);
  }

  return failed;
};

module.exports = ensureWeeklyTiles;
