const {fetchUrl} = require('fetch');

const asyncFetch = async function(url, options = {}) {
  return await new Promise((resolve, reject) => {
    fetchUrl(url, options, function(error, meta, body) {
      return error ? reject(error) : resolve(body);
    });
  });
};

module.exports = asyncFetch;
