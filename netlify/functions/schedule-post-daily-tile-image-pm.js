const {schedule} = require('@netlify/functions');
const postDailyTilesForSign = require('../../src/post/postDailyTilesForSign');
const {HOROSCOPES} = require('../../src/constants');

const handler = async function() {
  const nameIndex = new Date().getMinutes();

  if (nameIndex > 11) {
    return {statusCode: 200};
  }

  await postDailyTilesForSign(HOROSCOPES[nameIndex].name);

  return {
    statusCode: 200
  };
};

exports.handler = schedule('0,1,2,3,4,5,6,7,8,9,10,11 17 * * *', handler);
