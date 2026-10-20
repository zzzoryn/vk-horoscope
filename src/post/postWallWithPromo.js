// const {POST_FOOTER, COMMUNITY_COMMENT} = require('./promoTexts');
const getDate = require('../utils/getDate');
const {getVkForGroup, groupIdFromOwnerId} = require('../utils/getVkGroupToken');

/**
 * Legacy helper — do not pass to wall.post.
 * VK keeps guid→post_id forever: after delete, the same guid returns/restores the old id.
 * Dedup posts via wall.get (findExisting*) instead.
 *
 * @param scope {string}
 * @return {string}
 */
const buildPostGuid = function(scope) {
  const date = getDate().replace(/\s+/g, '-');
  return `vkhoro-${scope}-${date}`.slice(0, 32);
};

const enrichPostResponse = function(response, ownerId) {
  const postId = response.post_id;

  return Object.assign({}, response, {
    owner_id: ownerId,
    wall_url: `https://vk.com/wall${ownerId}_${postId}`
  });
};

/**
 * wall.post via community tokens (env or Google Sheet).
 * Promo comment disabled — see commented block below.
 *
 * Do not pass a stable `guid`: after a post is deleted, VK reuses the old post_id.
 *
 * @param params {{ owner_id: number, from_group: number, message: string, attachments?: string|string[] }}
 * @return {Promise<{ post_id: number, owner_id: number, wall_url: string }>}
 */
const postWallWithPromo = async function(params) {
  const groupId = groupIdFromOwnerId(params.owner_id);
  const groupVk = await getVkForGroup(groupId);

  const response = await groupVk.api.wall.post({
    owner_id: params.owner_id,
    from_group: params.from_group,
    // message: `${params.message}\n\n${POST_FOOTER}`,
    message: params.message,
    attachments: params.attachments
  });

  // Promo comment with link — disabled, may re-enable later.
  // try {
  //   await groupVk.api.wall.createComment({
  //     owner_id: params.owner_id,
  //     post_id: response.post_id,
  //     from_group: 1,
  //     message: COMMUNITY_COMMENT
  //   });
  // } catch (error) {
  //   console.error('postWallWithPromo: createComment failed', {
  //     owner_id: params.owner_id,
  //     post_id: response.post_id,
  //     code: error.code,
  //     message: error.message
  //   });
  //   return Object.assign({}, enrichPostResponse(response, params.owner_id), {
  //     commentError: error.message
  //   });
  // }

  return enrichPostResponse(response, params.owner_id);
};

module.exports = postWallWithPromo;
module.exports.buildPostGuid = buildPostGuid;
