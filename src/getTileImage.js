const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');

const getTileImage = async function (data) {
  const background = await asyncFetch(data.bgImage);

  const textPng = await sharp({
    create: {
      width: 1160,
      height: 200 + data.shortText.length,
      channels: 4,
      background: {r: 0, g: 0, b: 0, alpha: 0}
    }
  })
    .composite([
      {
        input: {
          text: {
            text: `<span foreground="white">${data.shortText}</span>`,
            font: 'sans-serif',
            width: 1160,
            height: 200 + data.shortText.length,
            align: 'centre',
            rgba: true
          }
        }
      }
    ])
    .png()
    .toBuffer();

  return await sharp(background)
    .resize(1280)
    .composite([
      {
        top: 452,
        left: 640 - data.date.length * 32 / 2,
        input: {
          text: {
            text: `<span foreground="white">${data.date}</span>`,
            font: 'sans-serif',
            width: data.date.length * 32,
            height: 70,
            rgba: true
          }
        }
      },
      {
        top: 560,
        left: 60,
        input: textPng
      },
      {
        top: 1070,
        left: 596,
        input: {
          text: {
            text: `<span foreground="white">${data.value}</span>`,
            font: 'sans-serif',
            width: 86,
            height: 160,
            rgba: true
          }
        }
      },
      {
        top: 1110,
        left: 321,
        input: {
          text: {
            text: `<span foreground="white">${data.business}</span>`,
            font: 'sans-serif',
            width: 58,
            height: 80,
            rgba: true
          }
        }
      },
      {
        top: 1110,
        left: 901,
        input: {
          text: {
            text: `<span foreground="white">${data.love}</span>`,
            font: 'sans-serif',
            width: 58,
            height: 80,
            rgba: true
          }
        }
      }
    ])
    .png()
    .toBuffer();
}

module.exports = getTileImage;
