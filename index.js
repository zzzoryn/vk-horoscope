require('dotenv').config();

const postDailyCommonWalls = require('./src/post/postDailyCommonWalls');

(async function() {
  await postDailyCommonWalls('gemini');
})();
