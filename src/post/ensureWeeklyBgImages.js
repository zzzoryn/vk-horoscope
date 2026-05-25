const {TYPES} = require('../constants');
const getSheetDoc = require('../utils/getSheetDoc');
const postWeeklyBgImage = require('./postWeeklyBgImage');

/**
 * @param rows {object[]}
 * @return {Promise<object[]>}
 */
const ensureWeeklyBgImages = async function(rows) {
  const missing = TYPES.filter(type => !rows[0][`${type.name}_bg_image`]);

  for (const type of missing) {
    console.log(`ensureWeeklyBgImages: uploading ${type.name}`);
    await postWeeklyBgImage(type.name);
  }

  if (!missing.length) {
    return rows;
  }

  const doc = await getSheetDoc();
  const sheet = doc.sheetsById[1404558085];

  return await sheet.getRows();
};

module.exports = ensureWeeklyBgImages;
