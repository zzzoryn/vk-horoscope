const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postDailyWalls = require('../../src/post/postDailyWalls');

const handler = scheduledHandler(async function() {
  const minutes = new Date().getMinutes();
  const stepNumber = Math.floor(minutes / 5) + 1;

  console.log('schedule-post-daily-horo step', stepNumber);

  return await postDailyWalls(stepNumber);
});

exports.handler = schedule('0,5,10,15 19 * * *', handler);
