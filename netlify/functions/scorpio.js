const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('scorpio');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("7 6 * * *", handler);
