const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');

const getDailyBusinessTileImage3 = async function({text}) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horoscope/business-bg.jpg`;
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
            text: `<span foreground="#BDC8D9">${text}</span>`,
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

module.exports = getDailyBusinessTileImage3;
