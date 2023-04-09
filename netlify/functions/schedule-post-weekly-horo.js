const {schedule} = require('@netlify/functions');
const postWeeklyWalls = require('../../src/post/postWeeklyWalls');

const handler = async function() {
  const minutes = new Date().getMinutes();
  const stepNumber = Math.floor(minutes / 5) + 1;

  await postWeeklyWalls(stepNumber);

  return {
    statusCode: 200
  };
};

exports.handler = schedule('0,5,10 18 * * 0', handler);
