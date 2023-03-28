const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('leo');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("4 6 * * *", handler);
