const {schedule} = require('@netlify/functions');
const createDailyHoroHandler = require('../../src/utils/createDailyHoroHandler');

exports.handler = schedule('5 19 * * *', createDailyHoroHandler(2));
