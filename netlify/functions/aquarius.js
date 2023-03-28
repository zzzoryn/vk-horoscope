const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('aquarius');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("10 6 * * *", handler);
