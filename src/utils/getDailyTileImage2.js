const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');
const {COLORS} = require('../constants');

const getDailyTileImage2 = async function({type, name, date}) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horoscope/${type}-${name}-bg-2.jpg`;
  const background = await asyncFetch(bgImageUrl);

  return await sharp(background)
    .composite([
      {
        top: 690,
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
    .toBuffer();
};

module.exports = getDailyTileImage2;
