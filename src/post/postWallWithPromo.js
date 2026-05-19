const {POST_FOOTER, COMMUNITY_COMMENT} = require('./promoTexts');
const withRetry = require('../utils/withRetry');
const getDate = require('../utils/getDate');

/**
 * @param scope {string}
 * @return {string}
 */
const buildPostGuid = function(scope) {
  const date = getDate().replace(/\s+/g, '-');
  return `vkhoro-${scope}-${date}`.slice(0, 32);
};

/**
 * wall.post with promo footer + comment from the token owner (admin).
 * Post is not rolled back if comment fails (avoids duplicate posts on retry).
 *
 * @param vk
 * @param params {{ owner_id: number, from_group: number, message: string, attachments?: string[], guid?: string }}
 * @return {Promise<{ post_id: number, commentError?: string }>}
 */
const postWallWithPromo = async function(vk, params) {
  const response = await vk.api.wall.post({
    owner_id: params.owner_id,
    from_group: params.from_group,
    message: `${params.message}\n\n${POST_FOOTER}`,
    attachments: params.attachments,
    guid: params.guid
  });

  try {
    await withRetry(() => vk.api.wall.createComment({
      owner_id: params.owner_id,
      post_id: response.post_id,
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
