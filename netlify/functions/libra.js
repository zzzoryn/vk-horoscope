const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('libra');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("6 6 * * *", handler);