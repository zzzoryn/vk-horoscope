const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  // const response = await postVkWall('taurus');
  // console.log(response);

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("1 6 * * *", handler);
