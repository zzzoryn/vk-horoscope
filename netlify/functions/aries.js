const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('aries');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("0 9 * * *", handler);
