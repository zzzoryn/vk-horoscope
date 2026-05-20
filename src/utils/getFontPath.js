const fs = require('fs');
const path = require('path');

const FONT_FILE = 'NotoSans-Regular.ttf';
const FONT_FAMILY = 'Noto Sans';

let cachedFontsDir;

const fontDirCandidates = function() {
  return [
    path.join(__dirname, 'fonts'),
    path.join(__dirname, '../../fonts'),
    path.join(process.cwd(), 'fonts'),
    '/var/task/fonts'
  ];
};

const resolveFontsDir = function() {
  if (cachedFontsDir) {
    return cachedFontsDir;
  }

  for (const dir of fontDirCandidates()) {
    if (fs.existsSync(path.join(dir, FONT_FILE))) {
      cachedFontsDir = dir;
      const fontConfigPath = path.join(dir, 'fonts.conf');

      if (!process.env.FONTCONFIG_FILE && fs.existsSync(fontConfigPath)) {
        process.env.FONTCONFIG_FILE = fontConfigPath;
      }

      return cachedFontsDir;
    }
  }

  throw new Error(`Font ${FONT_FILE} not found. Checked: ${fontDirCandidates().join(', ')}`);
};

const getFontPath = function() {
  return path.join(resolveFontsDir(), FONT_FILE);
};

module.exports = {
  getFontPath,
  FONT_FAMILY
};
