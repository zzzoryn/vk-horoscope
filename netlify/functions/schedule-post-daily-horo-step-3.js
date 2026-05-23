const {schedule} = require('@netlify/functions');
const createDailyHoroHandler = require('../../src/utils/createDailyHoroHandler');

exports.handler = schedule('10 19 * * *', createDailyHoroHandler(3));
