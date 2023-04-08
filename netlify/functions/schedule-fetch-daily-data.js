const {schedule} = require('@netlify/functions');
const fetchDailyHoroData = require('../../src/fetch/fetchDailyHoroData');

const handler = async function() {
  await fetchDailyHoroData();

  return {
    statusCode: 200
  };
};

exports.handler = schedule('0 4 * * *', handler);
