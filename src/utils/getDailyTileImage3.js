const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');
const {COLORS} = require('../constants');

const getDailyTileImage3 = async function({type, text}) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horoscope/${type}-bg.jpg`;
  const background = await asyncFetch(bgImageUrl);

  const texWidth = 940;
  const textHeight = text.length > 320 ? 520 : 200 + text.length;

  const textPng = await sharp({
    create: {
      width: texWidth,
      height: textHeight,
      channels: 4,
      background: {r: 0, g: 0, b: 0, alpha: 0}
    }
  })
    .composite([
      {
        input: {
          text: {
            text: `<span foreground="${COLORS[type]}">${text}</span>`,
            font: 'sans-serif',
            width: texWidth,
            height: textHeight,
            align: 'centre',
            rgba: true
          }
        }
      }
    ])
    .png()
    .toBuffer();

  return await sharp(background)
    .composite([{input: textPng}])
    .png()
    .toBuffer();
};

module.exports = getDailyTileImage3;
