const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES} = require('../constants');
const postTileImage = require('./postTileImage');

/**
 * @param name {String} horoscope name (aries, taurus, …)
 * @return {Promise<void>}
 */
const postDailyTilesForSign = async function(name) {
  const vk = new VK({token: process.env.VK_API_TOKEN});
  const doc = await getSheetDoc();
  const rows = await doc.sheetsByIndex[0].getRows();

  for (const type of TYPES) {
    await postTileImage.postTileImageWithRetry(type.name, name, false, {vk, rows});
  }
};

module.exports = postDailyTilesForSign;
