const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');
const {COLORS} = require('../constants');

const getWeeklyBgImage = async function(type, date) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horo-weekly/${type}.jpg`;
  const background = await asyncFetch(bgImageUrl);

  return await sharp(background)
    .composite([
      {
        top: 324,
        left: 540 - date.length * 22 / 2,
        input: {
          text: {
            text: `<span foreground="${COLORS[type]}">${date}</span>`,
            font: 'sans-serif',
            width: date.length * 22,
            height: 50,
            rgba: true
          }
        }
      }
    ])
    .png()
    //.toFile('images/test.png');
    .toBuffer();
};

module.exports = getWeeklyBgImage;
