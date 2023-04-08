require('dotenv').config();


const postDailyWalls = require('./src/post/postDailyWalls');

(async function() {
  await postDailyWalls(3);
})();
