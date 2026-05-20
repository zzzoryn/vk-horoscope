const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const fetchWeeklyHoroData = require('../../src/fetch/fetchWeeklyHoroData');

const handler = scheduledHandler(async function() {
  await fetchWeeklyHoroData();
});

exports.handler = schedule('15 4 * * 0', handler);
