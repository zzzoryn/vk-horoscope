const {schedule} = require('@netlify/functions');
const createDailyHoroHandler = require('../../src/utils/createDailyHoroHandler');

exports.handler = schedule('0 19 * * *', createDailyHoroHandler(1));
