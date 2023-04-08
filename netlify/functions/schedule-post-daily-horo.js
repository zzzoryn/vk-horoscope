const {schedule} = require('@netlify/functions');
const postDailyWalls = require('../../src/post/postDailyWalls');

const handler = async function() {
  const minutes = new Date().getMinutes();
  const stepNumber = Math.floor(minutes / 5) + 1;

  await postDailyWalls(stepNumber);

  return {
    statusCode: 200
  };
};

exports.handler = schedule('0,5,10,15 19 * * *', handler);
