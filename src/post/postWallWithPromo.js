// const {POST_FOOTER, COMMUNITY_COMMENT} = require('./promoTexts');
const getDate = require('../utils/getDate');
const {getVkForGroup, groupIdFromOwnerId} = require('../utils/getVkGroupToken');

/**
 * Stable guid for wall.post idempotency (same day / same week slot).
 * Note: after deleting a VK post, the same guid returns the old post_id.
 *
 * @param scope {string}
 * @param date {string=} label like "25 октября" (defaults to getDate())
 * @return {string}
 */
const buildPostGuid = function(scope, date) {
  const dateKey = String(date || getDate()).replace(/\s+/g, '-');
  return `vkhoro-${scope}-${dateKey}`.slice(0, 32);
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
 * @param params {{ owner_id: number, from_group: number, message: string, attachments?: string|string[], guid?: string }}
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
    attachments: params.attachments,
    guid: params.guid
  });

  // Promo comment with link — disabled, may re-enable later.
  // const commentGuid = params.guid
  //   ? `${params.guid}-promo`.slice(0, 32)
  //   : undefined;
  //
  // try {
  //   await groupVk.api.wall.createComment({
  //     owner_id: params.owner_id,
  //     post_id: response.post_id,
  //     from_group: 1,
  //     message: COMMUNITY_COMMENT,
  //     guid: commentGuid
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
