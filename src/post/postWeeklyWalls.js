const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');
const postWallWithPromo = require('./postWallWithPromo');
const {isTileFresh} = require('./tileFreshness');
const pinWallPost = require('./pinWallPost');
const {extractPostId} = pinWallPost;
const {getVkForGroup} = require('../utils/getVkGroupToken');

/** Type slots 0–4 + sign slots 5–16 */
const WEEKLY_SLOT_COUNT = TYPES.length + HOROSCOPES.length;

const buildWeeklyPostGuid = function(scope, weeklyDate) {
  const dateKey = String(weeklyDate).replace(/\s+/g, '-');
  return `vkhoro-${scope}-${dateKey}`.slice(0, 32);
};

const getWallItems = function(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.items || [];
};

const findExistingWallPost = async function(groupId, messagePrefix) {
  const groupVk = await getVkForGroup(groupId);
  const response = await groupVk.api.wall.get({
    owner_id: groupId * -1,
    filter: 'owner',
    count: 50
  });

  return getWallItems(response).find(post =>
    String(post.message || '').startsWith(messagePrefix)
  );
};

const assertWeeklyBgImage = function(rows, type) {
  if (rows[0][`${type.name}_bg_image`]) {
    return;
  }

  throw new Error(
    `Weekly bg image missing for ${type.name}. ` +
    'Wait for schedule-post-weekly-tile-image (minutes 12–16).'
  );
};

const assertWeeklySignTileFresh = function(rows, index, weeklyDate) {
  if (isTileFresh(rows[index], 'common', weeklyDate)) {
    return;
  }

  throw new Error(
    `Weekly sign tile not ready for ${weeklyDate}: common/${HOROSCOPES[index].name}. ` +
    'Wait for schedule-post-weekly-tile-image (minutes 0–11).'
  );
};

const resolveWeeklySlot = function(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= WEEKLY_SLOT_COUNT) {
    throw new Error(`postWeeklyWalls: slot must be 0–${WEEKLY_SLOT_COUNT - 1}, got ${slot}`);
  }

  if (slot < TYPES.length) {
    return {kind: 'type', type: TYPES[slot]};
  }

  return {kind: 'sign', index: slot - TYPES.length};
};

const postWallWithPromoAndPin = async function(postParams, groupId) {
  const response = await postWallWithPromo(postParams);
  const postId = extractPostId(response);

  try {
    await pinWallPost(groupId, postId);
  } catch (error) {
    console.error('postWallWithPromoAndPin: pin failed', {
      groupId,
      postId,
      code: error.code,
      message: error.message
    });
    throw error;
  }

  return response;
};

const getTypeSummaryMessage = function(type, rows, weeklyDate) {
  return `Гороскоп на неделю (${weeklyDate}):\n
&#9800; Овен\n${rows[0][type.name]}\n
&#9801; Телец\n${rows[1][type.name]}\n
&#9802; Близнецы\n${rows[2][type.name]}\n
&#9803; Рак\n${rows[3][type.name]}\n
&#9804; Лев\n${rows[4][type.name]}\n
&#9805; Дева\n${rows[5][type.name]}\n
&#9806; Весы\n${rows[6][type.name]}\n
&#9807; Скорпион\n${rows[7][type.name]}\n
&#9808; Стрелец\n${rows[8][type.name]}\n
&#9809; Козерог\n${rows[9][type.name]}\n
&#9810; Водолей\n${rows[10][type.name]}\n
&#9811; Рыбы\n${rows[11][type.name]}`;
};

const getSignWeeklyMessage = function(index, rows, weeklyDate) {
  return `Гороскоп на неделю (${weeklyDate}):\n
&#10084; Любовь: ${rows[index].love}\n
&#9752; Здоровье: ${rows[index].health}\n
&#128176; Бизнес: ${rows[index].business}\n
&#128139; Постель: ${rows[index].erotic}\n
#гороскоп #${HOROSCOPES[index].title.toLowerCase()} #любовь #здоровье #бизнес #постель`;
};

const postTypeSlot = async function(rows, type, weeklyDate) {
  assertWeeklyBgImage(rows, type);

  const message = getTypeSummaryMessage(type, rows, weeklyDate);
  const messagePrefix = `Гороскоп на неделю (${weeklyDate})`;
  let existingPost;

  try {
    existingPost = await findExistingWallPost(type.groupId, messagePrefix);
  } catch (error) {
    console.warn('postWeeklyWalls: failed to check existing type post', {
      type: type.name,
      code: error.code,
      message: error.message
    });
  }

  if (existingPost) {
    console.log('postWeeklyWalls: type post already exists', {
      type: type.name,
      postId: existingPost.id
    });

    return {post_id: existingPost.id, skipped: true, kind: 'type'};
  }

  return postWallWithPromoAndPin({
    owner_id: type.groupId * -1,
    from_group: 1,
    message,
    attachments: rows[0][`${type.name}_bg_image`],
    guid: buildWeeklyPostGuid(`weekly-${type.name}-summary`, weeklyDate)
  }, type.groupId);
};

const postSignSlot = async function(rows, index, weeklyDate) {
  assertWeeklySignTileFresh(rows, index, weeklyDate);

  const horoscope = HOROSCOPES[index];
  const message = getSignWeeklyMessage(index, rows, weeklyDate);
  const messagePrefix = `Гороскоп на неделю (${weeklyDate})`;
  let existingPost;

  try {
    existingPost = await findExistingWallPost(horoscope.groupId, messagePrefix);
  } catch (error) {
    console.warn('postWeeklyWalls: failed to check existing sign post', {
      sign: horoscope.name,
      code: error.code,
      message: error.message
    });
  }

  if (existingPost) {
    console.log('postWeeklyWalls: sign post already exists', {
      sign: horoscope.name,
      postId: existingPost.id
    });

    return {post_id: existingPost.id, skipped: true, kind: 'sign'};
  }

  return postWallWithPromoAndPin({
    owner_id: horoscope.groupId * -1,
    from_group: 1,
    message,
    attachments: rows[index].common_image,
    guid: buildWeeklyPostGuid(`weekly-sign-${horoscope.name}`, weeklyDate)
  }, horoscope.groupId);
};

/**
 * One wall post (+ pin) per invocation (fits Netlify scheduled ~30s limit).
 * Slots: 0–4 type groups, 5–16 sign groups.
 *
 * @param slot {number}
 * @return {Promise<object>}
 */
const postWeeklyWalls = async function(slot) {
  const resolved = resolveWeeklySlot(slot);

  const doc = await getSheetDoc();
  const rows = await doc.sheetsById[1404558085].getRows();
  const weeklyDate = rows[0].date;

  if (!weeklyDate) {
    throw new Error('Weekly sheet rows[0].date is empty — run schedule-fetch-weekly-data first');
  }

  console.log('postWeeklyWalls slot', slot, resolved.kind, {
    weeklyDate,
    type: resolved.type?.name,
    sign: resolved.index != null ? HOROSCOPES[resolved.index].name : undefined
  });

  if (resolved.kind === 'type') {
    return postTypeSlot(rows, resolved.type, weeklyDate);
  }

  return postSignSlot(rows, resolved.index, weeklyDate);
};

module.exports = postWeeklyWalls;
module.exports.WEEKLY_SLOT_COUNT = WEEKLY_SLOT_COUNT;
module.exports.resolveWeeklySlot = resolveWeeklySlot;
