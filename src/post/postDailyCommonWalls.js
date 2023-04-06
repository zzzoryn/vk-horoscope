const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const getDate = require('../utils/getDate');
const {HOROSCOPES, GROUP_IDS, TYPES_PUBLISH} = require('../constants');
const getDailyCommonTileImage = require('../utils/getDailyCommonTileImage');

const postDailyCommonWalls = async function(name) {
  const vk = new VK({token: process.env.VK_API_TOKEN});

  const doc = await getSheetDoc();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const getNumber = (min = 6, max = 10) => Math.round(Math.random() * (max - min) + min);

  const horoscope = HOROSCOPES
    .map((item, index) => Object.assign({}, item, {index}))
    .filter(item => item.name === name)[0];

  const data = {
    name: name,
    date: getDate(),
    text: rows[horoscope.index]['common'],
    business: getNumber(),
    love: getNumber()
  };

  data.daily = Math.ceil((data.business + data.love) / 2);

  const tileImage = await getDailyCommonTileImage(data);

  const attachments = await Promise.all([
    vk.upload.wallPhoto({
      group_id: GROUP_IDS.common,
      source: {value: tileImage}
    }),
    vk.upload.wallPhoto({
      group_id: GROUP_IDS[name],
      source: {value: tileImage}
    })
  ]);

  return await Promise.all([
    vk.api.wall.post({
      owner_id: GROUP_IDS.common * -1,
      from_group: 1,
      message: `${horoscope.title}, гороскоп на ${data.date}:`,
      attachments: `photo${attachments[0].ownerId}_${attachments[0].id}`,
      publish_date: new Date(new Date().toDateString() + ` ${horoscope.publish} +0300`).getTime() / 1000
    }),
    vk.api.wall.post({
      owner_id: GROUP_IDS[name] * -1,
      from_group: 1,
      message: `${horoscope.title}, гороскоп на ${data.date}:`,
      attachments: `photo${attachments[1].ownerId}_${attachments[1].id}`,
      publish_date: new Date(new Date().toDateString() + ` ${TYPES_PUBLISH.common} +0300`).getTime() / 1000
    })
  ]);

};

module.exports = postDailyCommonWalls;
