const {VK} = require('vk-io');
const getDate = require('../utils/getDate');
const getSheetDoc = require('../utils/getSheetDoc');
const getTileImage = require('../utils/getTileImage');
const {HOROSCOPES} = require('../constants');

/**
 * @param type {String}
 * @param name {String}
 * @param isWeekly {Boolean}
 * @return {Promise<void>}
 */
const postTileImage = async function(type, name, isWeekly) {
  const vk = new VK({token: process.env.VK_API_TOKEN});

  const doc = await getSheetDoc();
  const sheet = isWeekly ? doc.sheetsById[1404558085] : doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const date = isWeekly ? rows[0].date : getDate();

  const horoscope = HOROSCOPES
    .map((item, index) => Object.assign({}, item, {index}))
    .filter(item => item.name === name)[0];

  const image = await getTileImage(type, name, date, rows[horoscope.index][type]);

  const attachment = await vk.upload.wallPhoto({
    group_id: horoscope.groupId,
    source: {value: image}
  });

  rows[horoscope.index][`${type}_image`] = `photo${attachment.ownerId}_${attachment.id}`;

  await rows[horoscope.index].save();
};

module.exports = postTileImage;
