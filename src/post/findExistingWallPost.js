const {VK} = require('vk-io');

let userVk;

const getUserVk = function() {
  if (!process.env.VK_API_TOKEN) {
    throw new Error('VK_API_TOKEN is required to check existing wall posts');
  }

  if (!userVk) {
    userVk = new VK({token: process.env.VK_API_TOKEN});
  }

  return userVk;
};

const getWallItems = function(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.items || [];
};

const normalizeMessage = function(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
};

/**
 * Look up an existing owner post by message prefix.
 * Uses the user token — community tokens often cannot wall.get reliably.
 *
 * @param groupId {number}
 * @param messagePrefix {string}
 * @return {Promise<object|undefined>}
 */
const findExistingWallPost = async function(groupId, messagePrefix) {
  const prefix = normalizeMessage(messagePrefix);
  const response = await getUserVk().api.wall.get({
    owner_id: groupId * -1,
    filter: 'owner',
    count: 100
  });

  return getWallItems(response).find(post =>
    normalizeMessage(post.message).startsWith(prefix)
  );
};

module.exports = findExistingWallPost;
