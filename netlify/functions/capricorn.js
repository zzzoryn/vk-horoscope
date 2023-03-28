const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('capricorn');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("9 6 * * *", handler);
