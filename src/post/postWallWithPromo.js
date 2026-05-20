const {POST_FOOTER, COMMUNITY_COMMENT} = require('./promoTexts');
const withRetry = require('../utils/withRetry');
const getDate = require('../utils/getDate');
const {getVkForGroup, groupIdFromOwnerId} = require('../utils/getVkGroupToken');

/**
 * @param scope {string}
 * @return {string}
 */
const buildPostGuid = function(scope) {
  const date = getDate().replace(/\s+/g, '-');
  return `vkhoro-${scope}-${date}`.slice(0, 32);
};

/**
 * wall.post + promo comment via community tokens (env or Google Sheet).
 * Post is not rolled back if comment fails (avoids duplicate posts on retry).
 *
 * @param params {{ owner_id: number, from_group: number, message: string, attachments?: string[], guid?: string }}
 * @return {Promise<{ post_id: number, commentError?: string }>}
 */
const postWallWithPromo = async function(params) {
  const groupId = groupIdFromOwnerId(params.owner_id);
  const groupVk = await getVkForGroup(groupId);

  const response = await groupVk.api.wall.post({
    owner_id: params.owner_id,
    from_group: params.from_group,
    message: `${params.message}\n\n${POST_FOOTER}`,
    attachments: params.attachments,
    guid: params.guid
  });

  try {
    await withRetry(() => groupVk.api.wall.createComment({
      owner_id: params.owner_id,
      post_id: response.post_id,
      from_group: 1,
      message: COMMUNITY_COMMENT
    }), 3, 1500);
  } catch (error) {
    console.error('postWallWithPromo: createComment failed', {
      owner_id: params.owner_id,
      post_id: response.post_id,
      code: error.code,
      message: error.message
    });
    return Object.assign({}, response, {commentError: error.message});
  }

  return response;
};

module.exports = postWallWithPromo;
module.exports.buildPostGuid = buildPostGuid;
