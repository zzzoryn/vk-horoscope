const {schedule} = require('@netlify/functions');
const createDailyHoroHandler = require('../../src/utils/createDailyHoroHandler');

exports.handler = schedule('15 19 * * *', createDailyHoroHandler(4));
