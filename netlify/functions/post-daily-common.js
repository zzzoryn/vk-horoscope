const postDailyCommonWalls = require('../../src/post/postDailyCommonWalls');
const {HOROSCOPES} = require('../../src/constants');

exports.handler = async function(event) {

  try {
    const body = JSON.parse(event.body);
    const index = parseInt(body.index);

    if (!index || index > 11) {
      return {
        statusCode: 500,
        body: JSON.stringify({status: 'error', message: 'Index must be a number from 0 to 11'})
      };
    }

    const responses = await postDailyCommonWalls(HOROSCOPES[index].name);

    return {
      statusCode: 200,
      body: JSON.stringify({status: 'ok', responses})
    };
  }
  catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({status: 'error', message: error.message})
    };
  }
};
