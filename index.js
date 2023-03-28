require('dotenv').config();

const postVkWall = require('./src/postVkWall');

(async function() {
  const response = await postVkWall('gemini');
  console.log(response);
})();
