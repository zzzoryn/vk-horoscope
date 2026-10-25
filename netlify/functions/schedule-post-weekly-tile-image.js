const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postTileImage = require('../../src/post/postTileImage');
const postWeeklyBgImage = require('../../src/post/postWeeklyBgImage');
const {TYPES, HOROSCOPES} = require('../../src/constants');

const handler = scheduledHandler(async function() {
  const minutes = new Date().getUTCMinutes();

  if (minutes < 12) {
    const name = HOROSCOPES[minutes].name;
    console.log('schedule-post-weekly-tile-image common', name);
    await postTileImage.postTileImageWithRetry('common', name, true);
    return {kind: 'sign', sign: name};
  }

  if (minutes > 16) {
    return {skipped: true, reason: 'slot-out-of-range', minutes};
  }

  const type = TYPES[minutes - 12].name;
  console.log('schedule-post-weekly-tile-image bg', type);
  await postWeeklyBgImage(type);
  return {kind: 'bg', bg: type};
}, {name: 'schedule-post-weekly-tile-image', minuteKey: true});

exports.handler = schedule('0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 6 * * 0', handler);
