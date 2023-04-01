const fetchDailyHoroData = require('../../src/fetch/fetchDailyHoroData');

exports.handler = async function() {
  try {
    await fetchDailyHoroData();
    return {
      statusCode: 200,
      body: JSON.stringify({status: 'ok'})
    };
  }
  catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({status: 'error', message: error.message})
    };
  }
};
