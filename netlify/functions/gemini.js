const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('gemini');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("2 6 * * *", handler);
