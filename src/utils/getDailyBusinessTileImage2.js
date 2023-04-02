const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');

const getDailyBusinessTileImage2 = async function({name, date}) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horoscope/business-${name}-bg-2.jpg`;
  const background = await asyncFetch(bgImageUrl);

  return await sharp(background)
    .composite([
      {
        top: 690,
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

module.exports = getDailyBusinessTileImage2;
