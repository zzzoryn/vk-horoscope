const {schedule} = require('@netlify/functions');
const postTileImage = require('../../src/post/postTileImage');
const postWeeklyBgImage = require('../../src/post/postWeeklyBgImage');
const {TYPES, HOROSCOPES} = require('../../src/constants');

const handler = async function() {
  const minutes = new Date().getMinutes();

  if (minutes < 12) {
    const name = HOROSCOPES[minutes].name;
    await postTileImage('common', name, true);
  }
  else {
    const type = TYPES[minutes-12].name;
    await postWeeklyBgImage(type);
  }

  return {
    statusCode: 200
  };
};

exports.handler = schedule('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 6 * * 0', handler);
