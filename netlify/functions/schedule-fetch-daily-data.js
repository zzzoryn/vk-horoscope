const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const fetchDailyHoroData = require('../../src/fetch/fetchDailyHoroData');

const handler = scheduledHandler(async function() {
  await fetchDailyHoroData();
});

exports.handler = schedule('0 4 * * *', handler);
