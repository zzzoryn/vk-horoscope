const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  const response = await postVkWall('virgo');
  console.log(response);

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("35 7 * * *", handler);
