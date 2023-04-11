const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const getWeeklyBgImage = require('../utils/getWeeklyBgImage');
const {TYPES} = require('../constants');

const postWeeklyBgImage = async function(type) {
  const vk = new VK({token: process.env.VK_API_TOKEN});

  const doc = await getSheetDoc();
  const sheet = doc.sheetsById[1404558085];
  const rows = await sheet.getRows();
  const date = rows[0].date;

  const horoscope = TYPES
    .map((item, index) => Object.assign({}, item, {index}))
    .filter(item => item.name === type)[0];

  const image = await getWeeklyBgImage(type, date);

  const attachment = await vk.upload.wallPhoto({
    group_id: horoscope.groupId,
    source: {value: image}
  });

  rows[0][`${type}_bg_image`] = `photo${attachment.ownerId}_${attachment.id}`;

  await rows[0].save();
};

module.exports = postWeeklyBgImage;
