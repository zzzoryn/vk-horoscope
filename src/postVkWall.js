const jsdom = require('jsdom');
const {VK} = require('vk-io');
const xml2js = require('xml2js');
const {horoXmlUrl, months, horoscopes} = require('./constants');
const asyncFetch = require('./asyncFetch');
const getHoroData = require('./getHoroData');
const getTileImage = require('./getTileImage');

const postVkWall = async function (name) {
  const horoscope = horoscopes.filter(item => item.name === name)[0];

  if (!horoscope) {
    return new Error(`Horoscope "${name}" does not exist`);
  }

  console.log(process.env.VK_API_TOKEN);

  const vk = new VK({token: process.env.VK_API_TOKEN});

  const parser = new xml2js.Parser({});
  const xmlResponse = await asyncFetch(horoXmlUrl);
  const allData = await parser.parseStringPromise(xmlResponse.toString());

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.getDate() + ' ' + months[tomorrow.getMonth()];

  const horoData = await getHoroData(horoscope.name, date, allData);
  const tileImage = await getTileImage({...horoData, bgImage: horoscope.bgImage});

  const attachment = await vk.upload.wallPhoto({
    group_id: 30706989,
    caption: horoData.text,
    source: {value: tileImage}
  });

  return await vk.api.wall.post({
    owner_id: -30706989,
    message: `${horoscope.title}, гороскоп на ${horoData.date}:\n(Кликни на изображение чтобы узнать подробности)`,
    attachments: `photo${attachment.ownerId}_${attachment.id}`,
    publish_date: new Date(new Date().toDateString() + ` ${horoscope.publishTime} +0300`).getTime() / 1000
  });
}

module.exports = postVkWall;
