const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');
const {COLORS} = require('../constants');
const {getFontPath, FONT_FAMILY} = require('./getFontPath');

const fontPath = getFontPath();

const getWeeklyBgImage = async function(type, date) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horo-weekly/${type}.jpg`;
  const background = await asyncFetch(bgImageUrl);

  const dateWidth = date.length * 22;

  return await sharp(background)
    .composite([
      {
        top: 324,
        left: 540 - dateWidth / 2,
        input: {
          text: {
            text: `<span foreground="${COLORS[type]}">${date}</span>`,
            font: FONT_FAMILY,
            fontfile: fontPath,
            width: dateWidth,
            height: 50,
            rgba: true
          }
        }
      }
    ])
    .png()
    .toBuffer();
};

module.exports = getWeeklyBgImage;
