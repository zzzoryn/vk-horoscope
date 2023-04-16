const {VK} = require('vk-io');
const {TYPES} = require('../../src/constants');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 501,
      body: JSON.stringify({message: 'Not Implemented'}),
      headers: {'content-type': 'application/json'}
    };
  }

  if (!event.body.image) {
    return {
      statusCode: 200,
      body: JSON.stringify({message: 'No image'}),
      headers: {'content-type': 'application/json'}
    };
  }

  try {
    const vk = new VK({token: process.env.VK_API_TOKEN});
    const horoscope = TYPES[0];

    const attachment = await vk.upload.wallPhoto({
      group_id: horoscope.groupId,
      source: {value: event.body.image}
    });

    return {
      statusCode: 200,
      body: JSON.stringify({attachment: `photo${attachment.ownerId}_${attachment.id}`}),
      headers: {'content-type': 'application/json'}
    };
  }
  catch (err) {
    return {
      statusCode: 200,
      body: JSON.stringify({type: 'error', message: err.message}),
      headers: {'content-type': 'application/json'}
    };
  }
};
