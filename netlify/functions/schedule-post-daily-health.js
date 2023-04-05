const {schedule} = require('@netlify/functions');
const postDailyWalls = require('../../src/post/postDailyWalls');
const {HOROSCOPES} = require('../../src/constants');

const handler = async function() {
  const index = new Date().getMinutes();
  await postDailyWalls('health', HOROSCOPES[index].name);

  return {
    statusCode: 200
  };
};

exports.handler = schedule('0,1,2,3,4,5,6,7,8,9,10,11 6 * * *', handler);
