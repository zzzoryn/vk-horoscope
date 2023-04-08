const {schedule} = require('@netlify/functions');
const postTileImage = require('../../src/post/postTileImage');
const {TYPES, HOROSCOPES} = require('../../src/constants');

const handler = async function() {
  const minutes = new Date().getMinutes();
  const typeIndex = Math.floor(minutes / 12);
  const nameIndex = minutes % 12;

  const type = TYPES[typeIndex].name;
  const name = HOROSCOPES[nameIndex].name;

  await postTileImage(type, name);

  return {
    statusCode: 200
  };
};

exports.handler = schedule('* 5 * * *', handler);
