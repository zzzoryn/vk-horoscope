const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const postWeeklyWalls = require('../../src/post/postWeeklyWalls');

const handler = scheduledHandler(async function() {
  const minutes = new Date().getMinutes();
  const stepNumber = Math.floor(minutes / 5) + 1;

  console.log('schedule-post-weekly-horo step', stepNumber);

  return await postWeeklyWalls(stepNumber);
});

exports.handler = schedule('0,5,10 18 * * 0', handler);
