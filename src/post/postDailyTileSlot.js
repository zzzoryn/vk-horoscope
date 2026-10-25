const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const getDate = require('../utils/getDate');
const {TYPES, HOROSCOPES} = require('../constants');
const {isTileFresh} = require('./tileFreshness');
const postTileImage = require('./postTileImage');

/** 12 signs × 5 types = 60 one-tile slots (fits Netlify scheduled ~30s limit). */
const DAILY_TILE_SLOT_COUNT = HOROSCOPES.length * TYPES.length;

/**
 * @param slot {number} 0–59
 * @return {{signIndex: number, typeIndex: number, sign: string, type: string}}
 */
const resolveDailyTileSlot = function(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= DAILY_TILE_SLOT_COUNT) {
    throw new Error(`postDailyTileSlot: slot must be 0–${DAILY_TILE_SLOT_COUNT - 1}, got ${slot}`);
  }

  const signIndex = Math.floor(slot / TYPES.length);
  const typeIndex = slot % TYPES.length;

  return {
    signIndex,
    typeIndex,
    sign: HOROSCOPES[signIndex].name,
    type: TYPES[typeIndex].name
  };
};

/**
 * Generate/upload a single daily tile. Skips when already fresh for content_date/getDate().
 *
 * @param slot {number}
 * @return {Promise<object>}
 */
const postDailyTileSlot = async function(slot) {
  const resolved = resolveDailyTileSlot(slot);
  const vk = new VK({token: process.env.VK_API_TOKEN});
  const doc = await getSheetDoc();
  const rows = await doc.sheetsByIndex[0].getRows();
  const expectedDate = rows[0]?.content_date || getDate();
  const row = rows[resolved.signIndex];

  if (isTileFresh(row, resolved.type, expectedDate)) {
    console.log('postDailyTileSlot: fresh, skip', resolved);
    return {
      skipped: true,
      reason: 'fresh',
      expectedDate,
      ...resolved
    };
  }

  console.log('postDailyTileSlot: regenerate', resolved, {expectedDate});
  await postTileImage.postTileImageWithRetry(resolved.type, resolved.sign, false, {vk, rows});

  return {
    skipped: false,
    expectedDate,
    ...resolved
  };
};

module.exports = postDailyTileSlot;
module.exports.DAILY_TILE_SLOT_COUNT = DAILY_TILE_SLOT_COUNT;
module.exports.resolveDailyTileSlot = resolveDailyTileSlot;
