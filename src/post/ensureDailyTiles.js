const {TYPES, HOROSCOPES} = require('../constants');
const {isTileFresh} = require('./tileFreshness');

const MAX_REGENERATIONS = 10;

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
  const postTileImage = require('./postTileImage');
  const failed = [];
  const skipped = [];
  let regenerated = 0;

  for (const type of TYPES) {
    for (const index of signIndexes) {
      if (isTileFresh(rows[index], type.name, expectedDate)) {
        continue;
      }

      if (regenerated >= MAX_REGENERATIONS) {
        skipped.push({type: type.name, sign: HOROSCOPES[index].name});
        continue;
      }

      const name = HOROSCOPES[index].name;

      try {
        await postTileImage.postTileImageWithRetry(type.name, name, false, {vk, rows});
        regenerated++;
        console.log(`ensureDailyTiles: regenerated ${type.name}/${name}`);
      } catch (error) {
        console.error(`ensureDailyTiles: failed ${type.name}/${name}`, error);
        failed.push({type: type.name, sign: name, error: error.message});
      }
    }
  }

  if (skipped.length) {
    console.warn(`ensureDailyTiles: cap ${MAX_REGENERATIONS} reached, skipped`, skipped);
  }

  return failed;
};

module.exports = ensureDailyTiles;
