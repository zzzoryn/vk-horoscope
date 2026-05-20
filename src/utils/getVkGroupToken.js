const {VK} = require('vk-io');
const getSheetDoc = require('./getSheetDoc');

const TOKENS_SHEET_TITLE = process.env.VK_GROUP_TOKENS_SHEET || 'group_tokens';

let groupTokensCache;
let loadPromise;

const parseTokensJson = function(raw, source) {
  try {
    const parsed = JSON.parse(String(raw).trim());

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('expected JSON object');
    }

    return parsed;
  } catch (error) {
    throw new Error(`${source} must be valid JSON: {"groupId":"token",...} (${error.message})`);
  }
};

const loadGroupTokensFromSheet = async function() {
  const doc = await getSheetDoc();
  const sheet = doc.sheetsByTitle[TOKENS_SHEET_TITLE];

  if (!sheet) {
    throw new Error(
      `Sheet tab "${TOKENS_SHEET_TITLE}" not found. Create it and paste VK_GROUP_TOKENS JSON in cell A1, ` +
      'or set VK_GROUP_TOKENS in .env for local runs.'
    );
  }

  await sheet.loadCells('A1');
  const raw = sheet.getCell(0, 0).value;

  if (!raw) {
    throw new Error(
      `Sheet "${TOKENS_SHEET_TITLE}" cell A1 is empty. Paste one-line VK_GROUP_TOKENS JSON there (Netlify Lambda env limit is 4KB).`
    );
  }

  return parseTokensJson(raw, `"${TOKENS_SHEET_TITLE}"!A1`);
};

const loadGroupTokensInner = async function() {
  const raw = process.env.VK_GROUP_TOKENS;

  if (raw) {
    return parseTokensJson(raw, 'VK_GROUP_TOKENS');
  }

  return loadGroupTokensFromSheet();
};

/**
 * @return {Promise<Record<string, string>>}
 */
const loadGroupTokens = async function() {
  if (groupTokensCache !== undefined) {
    return groupTokensCache;
  }

  if (!loadPromise) {
    loadPromise = loadGroupTokensInner()
      .then(tokens => {
        groupTokensCache = tokens;
        return tokens;
      })
      .catch(error => {
        loadPromise = undefined;
        throw error;
      });
  }

  return loadPromise;
};

/**
 * @param groupId {number|string}
 * @return {Promise<string>}
 */
const getGroupToken = async function(groupId) {
  const id = String(groupId);
  const token = (await loadGroupTokens())[id];

  if (!token) {
    throw new Error(
      `No community token for group ${id}. Add key "${id}" in VK_GROUP_TOKENS or sheet "${TOKENS_SHEET_TITLE}" A1.`
    );
  }

  return token;
};

/**
 * @param groupId {number|string}
 * @return {Promise<VK>}
 */
const getVkForGroup = async function(groupId) {
  return new VK({token: await getGroupToken(groupId)});
};

/** @deprecated use getVkForGroup */
const getVkForGroupComment = getVkForGroup;

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
  getVkForGroup,
  getVkForGroupComment,
  groupIdFromOwnerId
};
