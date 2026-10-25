const {schedule} = require('@netlify/functions');
const scheduledHandler = require('../../src/utils/scheduledHandler');
const fetchDailyHoroData = require('../../src/fetch/fetchDailyHoroData');

const handler = scheduledHandler(async function() {
  await fetchDailyHoroData();
}, {name: 'schedule-fetch-daily-data'});

// Evening before tiles/posts (16:00 UTC = 19:00 MSK). Keeps sheet on "tomorrow"
// overnight so a missed publish can be caught up manually the next calendar day.
exports.handler = schedule('0 16 * * *', handler);
