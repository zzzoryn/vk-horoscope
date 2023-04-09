const {schedule} = require('@netlify/functions');
const fetchWeeklyHoroData = require('../../src/fetch/fetchWeeklyHoroData');

const handler = async function() {
  await fetchWeeklyHoroData();

  return {
    statusCode: 200
  };
};

exports.handler = schedule('15 4 * * 0', handler);
