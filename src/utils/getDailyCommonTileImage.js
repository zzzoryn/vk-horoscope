const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');

const getDailyCommonTileImage = async function({name, date, text, daily, business, love}) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horoscope/common-${name}-bg.jpg`;
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
            text: `<span foreground="#D7BE8A">${text}</span>`,
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
        top: 916,
        left: 540 - date.length * 22 / 2,
        input: {
          text: {
            text: `<span foreground="#D7BE8A">${date}</span>`,
            font: 'sans-serif',
            width: date.length * 22,
            height: 50,
            rgba: true
          }
        }
      },
      {
        top: 980,
        left: 540 - (daily === 10 ? 52 : 26) / 2,
        input: {
          text: {
            text: `<span foreground="#D7BE8A">${daily}</span>`,
            font: 'sans-serif',
            width: daily === 10 ? 52 : 26,
            height: 50,
            rgba: true
          }
        }
      },
      {
        top: 980,
        left: 347 - (business === 10 ? 52 : 26) / 2,
        input: {
          text: {
            text: `<span foreground="#D7BE8A">${business}</span>`,
            font: 'sans-serif',
            width: business === 10 ? 52 : 26,
            height: 50,
            rgba: true
          }
        }
      },
      {
        top: 980,
        left: 733 - (love === 10 ? 52 : 26) / 2,
        input: {
          text: {
            text: `<span foreground="#D7BE8A">${love}</span>`,
            font: 'sans-serif',
            width: love === 10 ? 52 : 26,
            height: 50,
            rgba: true
          }
        }
      },
    ])
    .png()
    .toBuffer();
};

module.exports = getDailyCommonTileImage;
