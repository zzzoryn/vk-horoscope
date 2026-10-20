// const {POST_FOOTER, COMMUNITY_COMMENT} = require('./promoTexts');
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

const getByIdPosts = function(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.items || [];
};

const wallPostExists = async function(groupVk, ownerId, postId) {
  const response = await groupVk.api.wall.getById({
    posts: `${ownerId}_${postId}`
  });

  return getByIdPosts(response).length > 0;
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
 * If VK returns a post_id for a reused guid of a deleted post, retries with a fresh guid.
 *
 * @param params {{ owner_id: number, from_group: number, message: string, attachments?: string[], guid?: string }}
 * @return {Promise<{ post_id: number, owner_id: number, wall_url: string, commentError?: string, guid_retry?: boolean }>}
 */
const postWallWithPromo = async function(params) {
  const groupId = groupIdFromOwnerId(params.owner_id);
  const groupVk = await getVkForGroup(groupId);

  const postPayload = {
    owner_id: params.owner_id,
    from_group: params.from_group,
    // message: `${params.message}\n\n${POST_FOOTER}`,
    message: params.message,
    attachments: params.attachments,
    guid: params.guid
  };

  let response = await groupVk.api.wall.post(postPayload);

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
  //   return Object.assign({}, response, {commentError: error.message});
  // }

  let exists = false;

  try {
    exists = await wallPostExists(groupVk, params.owner_id, response.post_id);
  } catch (error) {
    console.warn('postWallWithPromo: wall.getById failed', {
      owner_id: params.owner_id,
      post_id: response.post_id,
      code: error.code,
      message: error.message
    });
    return enrichPostResponse(response, params.owner_id);
  }

  if (exists) {
    return enrichPostResponse(response, params.owner_id);
  }

  // Likely guid reuse for a deleted post — VK returns old post_id, wall is empty.
  console.warn('postWallWithPromo: post_id not found on wall, retrying with fresh guid', {
    owner_id: params.owner_id,
    post_id: response.post_id,
    guid: params.guid
  });

  const retryGuid = params.guid
    ? `${String(params.guid).slice(0, 24)}-r${Date.now().toString(36)}`.slice(0, 32)
    : undefined;

  response = await groupVk.api.wall.post(Object.assign({}, postPayload, {
    guid: retryGuid
  }));

  return enrichPostResponse(
    Object.assign({}, response, {guid_retry: true}),
    params.owner_id
  );
};

module.exports = postWallWithPromo;
module.exports.buildPostGuid = buildPostGuid;
