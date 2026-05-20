const {VK} = require('vk-io');

let groupTokensCache;

const loadGroupTokens = function() {
  if (groupTokensCache !== undefined) {
    return groupTokensCache;
  }

  const raw = process.env.VK_GROUP_TOKENS;

  if (!raw) {
    groupTokensCache = {};
    return groupTokensCache;
  }

  try {
    groupTokensCache = JSON.parse(raw);
  } catch (error) {
    throw new Error('VK_GROUP_TOKENS must be valid JSON: {"groupId":"token",...}');
  }

  return groupTokensCache;
};

/**
 * Community API key for wall.createComment (from_group: 1).
 * Do not fall back to VK_API_TOKEN — user-token comments risk account blocks.
 *
 * @param groupId {number|string}
 * @return {string}
 */
const getGroupToken = function(groupId) {
  const id = String(groupId);
  const token = loadGroupTokens()[id];

  if (!token) {
    throw new Error(
      `No community token for group ${id}. Add VK_GROUP_TOKENS["${id}"] (Управление → Работа с API).`
    );
  }

  return token;
};

/**
 * @param groupId {number|string}
 * @return {VK}
 */
const getVkForGroupComment = function(groupId) {
  return new VK({token: getGroupToken(groupId)});
};

/**
 * @param ownerId {number} negative community id from wall.post
 * @return {number}
 */
const groupIdFromOwnerId = function(ownerId) {
  return Math.abs(ownerId);
};

module.exports = {
  loadGroupTokens,
  getGroupToken,
  getVkForGroupComment,
  groupIdFromOwnerId
};
