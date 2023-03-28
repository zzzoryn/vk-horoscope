const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('virgo');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("5 6 * * *", handler);
