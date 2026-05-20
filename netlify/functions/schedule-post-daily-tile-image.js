const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postDailyTilesForSign = require('../../src/post/postDailyTilesForSign');
const {HOROSCOPES} = require('../../src/constants');

const handler = scheduledHandler(async function() {
  const nameIndex = new Date().getMinutes();

  if (nameIndex > 11) {
    return;
  }

  const name = HOROSCOPES[nameIndex].name;

  console.log('schedule-post-daily-tile-image sign', name);

  await postDailyTilesForSign(name);
});

exports.handler = schedule('0,1,2,3,4,5,6,7,8,9,10,11 5 * * *', handler);
