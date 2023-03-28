const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('sagittarius');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("8 6 * * *", handler);
