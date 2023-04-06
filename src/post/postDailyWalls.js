const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const getDate = require('../utils/getDate');
const {HOROSCOPES, GROUP_IDS, TYPES_PUBLISH} = require('../constants');
const getDailyTileImage = require('../utils/getDailyTileImage');
const getDailyTileImage2 = require('../utils/getDailyTileImage2');
const getDailyTileImage3 = require('../utils/getDailyTileImage3');

const postDailyWalls = async function(type, name) {
  const vk = new VK({token: process.env.VK_API_TOKEN});

  const doc = await getSheetDoc();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const horoscope = HOROSCOPES
    .map((item, index) => Object.assign({}, item, {index}))
    .filter(item => item.name === name)[0];

  const data = {
    type,
    name,
    date: getDate(),
    text: rows[horoscope.index][type]
  };

  const tileImage1 = await getDailyTileImage(data);
  const tileImage2 = await getDailyTileImage2(data);
  const tileImage3 = await getDailyTileImage3(data);

  const attachments = await Promise.all([
    vk.upload.wallPhoto({
      group_id: GROUP_IDS[type],
      source: {value: tileImage1}
    }),
    vk.upload.wallPhoto({
      group_id: GROUP_IDS[name],
      source: {value: tileImage2}
    }),
    vk.upload.wallPhoto({
      group_id: GROUP_IDS[name],
      source: {value: tileImage3}
    })
  ]);

  return await Promise.all([
    vk.api.wall.post({
      owner_id: GROUP_IDS[type] * -1,
      from_group: 1,
      message: `${horoscope.title}, гороскоп на ${data.date}:`,
      attachments: `photo${attachments[0].ownerId}_${attachments[0].id}`,
      publish_date: new Date(new Date().toDateString() + ` ${horoscope.publish} +0300`).getTime() / 1000
    }),
    vk.api.wall.post({
      owner_id: GROUP_IDS[name] * -1,
      from_group: 1,
      message: `${horoscope.title}, гороскоп на ${data.date}:`,
      attachments: [`photo${attachments[1].ownerId}_${attachments[1].id}`, `photo${attachments[2].ownerId}_${attachments[2].id}`],
      publish_date: new Date(new Date().toDateString() + ` ${TYPES_PUBLISH[type]} +0300`).getTime() / 1000
    })
  ]);

};

module.exports = postDailyWalls;
