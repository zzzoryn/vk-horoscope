const {VK} = require('vk-io');
const withRetry = require('../utils/withRetry');

let userVk;

const getUserVk = function() {
  if (!process.env.VK_API_TOKEN) {
    throw new Error('VK_API_TOKEN is required for wall.pin (unavailable with community tokens)');
  }

  if (!userVk) {
    userVk = new VK({token: process.env.VK_API_TOKEN});
  }

  return userVk;
};

/**
 * @param response {{ post_id?: number }}
 * @return {number}
 */
const extractPostId = function(response) {
  const postId = response?.post_id;

  if (!postId) {
    throw new Error(`wall.post returned no post_id (${JSON.stringify(response)})`);
  }

  return postId;
};

/**
 * VK error 27: wall.pin does not work with community (group) tokens — use user token.
 *
 * @param groupId {number}
 * @param postId {number}
 */
const pinWallPost = async function(groupId, postId) {
  const vk = getUserVk();

  await withRetry(() => vk.api.wall.pin({
    owner_id: groupId * -1,
    post_id: postId
  }), 3, 1500);
};

module.exports = pinWallPost;
module.exports.extractPostId = extractPostId;
