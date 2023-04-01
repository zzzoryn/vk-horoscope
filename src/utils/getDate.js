const {MONTHS} = require('../constants');

const getDate = function(){
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getDate() + ' ' + MONTHS[tomorrow.getMonth()];
}

module.exports = getDate;
