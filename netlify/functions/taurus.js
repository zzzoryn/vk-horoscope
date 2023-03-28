const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('taurus');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("1 6 * * *", handler);
