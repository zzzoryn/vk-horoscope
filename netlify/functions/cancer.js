const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  await postVkWall('cancer');

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("3 6 * * *", handler);
