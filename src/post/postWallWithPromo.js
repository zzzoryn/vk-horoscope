const {POST_FOOTER, COMMUNITY_COMMENT} = require('./promoTexts');
const withRetry = require('../utils/withRetry');

/**
 * wall.post with promo footer + community comment (from_group).
 * Token needs wall scope; communities must allow comments from the group.
 *
 * @param vk
 * @param params {{ owner_id: number, from_group: number, message: string, attachments?: string[] }}
 * @return {Promise<{ post_id: number }>}
 */
const postWallWithPromo = async function(vk, params) {
  const response = await vk.api.wall.post({
    owner_id: params.owner_id,
    from_group: params.from_group,
    message: `${params.message}\n\n${POST_FOOTER}`,
    attachments: params.attachments
  });

  await withRetry(() => vk.api.wall.createComment({
    owner_id: params.owner_id,
    post_id: response.post_id,
    from_group: 1,
    message: COMMUNITY_COMMENT
  }), 3, 1500);

  return response;
};

module.exports = postWallWithPromo;
