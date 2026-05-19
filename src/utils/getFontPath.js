const path = require('path');

const FONT_FILE = 'NotoSans-Regular.ttf';
const FONT_FAMILY = 'Noto Sans';

const fontsDir = path.join(__dirname, '../../fonts');
const fontConfigPath = path.join(fontsDir, 'fonts.conf');

if (!process.env.FONTCONFIG_FILE) {
  process.env.FONTCONFIG_FILE = fontConfigPath;
}

const getFontPath = function() {
  return path.join(fontsDir, FONT_FILE);
};

module.exports = {
  getFontPath,
  FONT_FAMILY
};
