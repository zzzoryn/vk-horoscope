const {VK} = require('vk-io');
const getDate = require('../utils/getDate');
const getSheetDoc = require('../utils/getSheetDoc');
const getTileImage = require('../utils/getTileImage');
const {TYPES, HOROSCOPES} = require('../constants');
const withRetry = require('../utils/withRetry');
const {imageDateKey} = require('./tileFreshness');

const getTileUploadGroupId = function(type, horoscope) {
  if (type === 'common') {
    return horoscope.groupId;
  }

  return TYPES.filter(item => item.name === type)[0].groupId;
};

/**
 * @param type {String}
 * @param name {String}
 * @param isWeekly {Boolean}
 * @param options {{ vk?: VK, rows?: object[] }}
 * @return {Promise<void>}
 */
const postTileImage = async function(type, name, isWeekly, options = {}) {
  const vk = options.vk || new VK({token: process.env.VK_API_TOKEN});

  let rows = options.rows;

  if (!rows) {
    const doc = await getSheetDoc();
    const sheet = isWeekly ? doc.sheetsById[1404558085] : doc.sheetsByIndex[0];
    rows = await sheet.getRows();
  }

  const date = isWeekly ? rows[0].date : getDate();

  const horoscope = HOROSCOPES
    .map((item, index) => Object.assign({}, item, {index}))
    .filter(item => item.name === name)[0];

  const image = await getTileImage(type, name, date, rows[horoscope.index][type]);

  const attachment = await vk.upload.wallPhoto({
    group_id: getTileUploadGroupId(type, horoscope),
    source: {value: image}
  });

  rows[horoscope.index][`${type}_image`] = `photo${attachment.ownerId}_${attachment.id}`;
  rows[horoscope.index][imageDateKey(type)] = date;

  await rows[horoscope.index].save();
};

const postTileImageWithRetry = function(type, name, isWeekly, options = {}) {
  return withRetry(
    () => postTileImage(type, name, isWeekly, options),
    3,
    1500
  );
};

module.exports = postTileImage;
module.exports.postTileImageWithRetry = postTileImageWithRetry;
module.exports.getTileUploadGroupId = getTileUploadGroupId;
