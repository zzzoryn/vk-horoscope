const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');

const getDailyTileImage = async function({type, name, date, text}) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horoscope/${type}-${name}-bg.jpg`;
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
    .composite([
      {
        input: textPng
      },
      {
        top: 946,
        left: 540 - date.length * 22 / 2,
        input: {
          text: {
            text: `<span foreground="#BDC8D9">${date}</span>`,
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

module.exports = getDailyTileImage;
