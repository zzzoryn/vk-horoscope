const path = require('path');
const sharp = require('sharp');
const asyncFetch = require('./asyncFetch');
const {COLORS} = require('../constants');
const {getFontPath, FONT_FAMILY} = require('./getFontPath');

const fontPath = getFontPath();

const textRenderOptions = function(text, width, height, color) {
  return {
    text: `<span foreground="${color}">${text}</span>`,
    font: FONT_FAMILY,
    fontfile: fontPath,
    width,
    height,
    align: 'centre',
    rgba: true
  };
};

const getTileImage = async function(type, name, date, text) {
  const bgImageUrl = `https://cdn.jsdelivr.net/gh/zzzoryn/sdn-images@master/vk-horo/${type}-${name}.jpg`;
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
          text: textRenderOptions(text, texWidth, textHeight, COLORS[type])
        }
      }
    ])
    .png()
    .toBuffer();

  const dateWidth = date.length * 22;

  return await sharp(background)
    .composite([
      {
        input: textPng
      },
      {
        top: 946,
        left: 540 - dateWidth / 2,
        input: {
          text: textRenderOptions(date, dateWidth, 50, COLORS[type])
        }
      }
    ])
    .png()
    .toBuffer();
};

module.exports = getTileImage;
