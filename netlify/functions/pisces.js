const { schedule } = require("@netlify/functions");
const postVkWall = require('../../src/postVkWall');

const handler = async function() {
  const response = await postVkWall('pisces');
  console.log(response);

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("11 6 * * *", handler);
