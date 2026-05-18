const {TYPES, HOROSCOPES} = require('../constants');
const {isTileFresh} = require('./tileFreshness');
const postTileImage = require('./postTileImage');

/**
 * Regenerate stale tiles for collage steps (only given sign row indexes).
 *
 * @param vk
 * @param rows
 * @param signIndexes {number[]}
 * @param expectedDate {string}
 * @return {Promise<object[]>} failed items
 */
const ensureDailyTiles = async function(vk, rows, signIndexes, expectedDate) {
  const failed = [];

  for (const type of TYPES) {
    for (const index of signIndexes) {
      if (isTileFresh(rows[index], type.name, expectedDate)) {
        continue;
      }

      const name = HOROSCOPES[index].name;

      try {
        await postTileImage.postTileImageWithRetry(type.name, name, false, {vk, rows});
        console.log(`ensureDailyTiles: regenerated ${type.name}/${name}`);
      } catch (error) {
        console.error(`ensureDailyTiles: failed ${type.name}/${name}`, error);
        failed.push({type: type.name, sign: name, error: error.message});
      }
    }
  }

  return failed;
};

module.exports = ensureDailyTiles;
