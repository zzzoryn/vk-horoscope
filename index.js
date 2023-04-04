require('dotenv').config();

const postDailyBusinessWalls = require('./src/post/postDailyWalls');

(async function() {
  // const data = {
  //   name: 'aries',
  //   date: '24 марта',
  //   text: 'Не пытайтесь сегодня усидеть на двух стульях одновременно: проработайте сначала хотя бы один проект. В этом случае вы точно будете знать, чего вы хотите, и пусть, придя к финишу, вы, возможно, и не будете первыми, но зато лучшим - не всяких сомнений.',
  // };

  await postDailyBusinessWalls('aries');
})();
