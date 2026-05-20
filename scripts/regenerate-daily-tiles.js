require('dotenv').config();

const {HOROSCOPES} = require('../src/constants');
const postDailyTilesForSign = require('../src/post/postDailyTilesForSign');

const signArg = process.argv[2];

const signs = signArg
  ? HOROSCOPES.filter(item => item.name === signArg)
  : HOROSCOPES;

if (signArg && signs.length === 0) {
  console.error(`Unknown sign: ${signArg}. Use: aries, taurus, gemini, ...`);
  process.exit(1);
}

(async function() {
  for (const horoscope of signs) {
    console.log(`Regenerating tiles for ${horoscope.name}...`);
    await postDailyTilesForSign(horoscope.name);
    console.log(`Done ${horoscope.name}`);
  }

  console.log('All done.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
