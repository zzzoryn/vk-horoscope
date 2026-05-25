const withRetry = require('../utils/withRetry');
const {getVkForGroup} = require('../utils/getVkGroupToken');

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
 * @param groupId {number}
 * @param postId {number}
 */
const pinWallPost = async function(groupId, postId) {
  const groupVk = await getVkForGroup(groupId);

  await withRetry(() => groupVk.api.wall.pin({
    owner_id: groupId * -1,
    post_id: postId
  }), 3, 1500);
};

module.exports = pinWallPost;
module.exports.extractPostId = extractPostId;
