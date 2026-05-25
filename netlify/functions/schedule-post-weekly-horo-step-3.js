const {schedule} = require('@netlify/functions');
const createWeeklyHoroHandler = require('../../src/utils/createWeeklyHoroHandler');

exports.handler = schedule('10 18 * * 0', createWeeklyHoroHandler(3));
