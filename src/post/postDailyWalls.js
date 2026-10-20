const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');
const getDate = require('../utils/getDate');
const postWallWithPromo = require('./postWallWithPromo');
const {isTileFresh} = require('./tileFreshness');
const {getVkForGroup} = require('../utils/getVkGroupToken');

const COLLAGE_PART_1 = [0, 1, 2, 3, 4, 5];
const COLLAGE_PART_2 = [6, 7, 8, 9, 10, 11];
const COLLAGE_PARTS = [{
  partNumber: 1,
  signIndexes: COLLAGE_PART_1
}, {
  partNumber: 2,
  signIndexes: COLLAGE_PART_2
}];

/** Collage slots 0–9 + sign slots 10–21 */
const DAILY_SLOT_COUNT = TYPES.length * COLLAGE_PARTS.length + HOROSCOPES.length;

const getCollageMessage = function(type, partNumber, date) {
  return `${type.title} на ${date} (Часть ${partNumber}):`;
};

const getSignMessage = function(index, date, rows) {
  return `Гороскоп на ${date}\n
&#10084; Любовь: ${rows[index].love}\n
&#9752; Здоровье: ${rows[index].health}\n
&#128176; Бизнес: ${rows[index].business}\n
&#128139; Постель: ${rows[index].erotic}\n
#гороскоп #${HOROSCOPES[index].title.toLowerCase()} #любовь #здоровье #бизнес #постель`;
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

const assertCollageTilesFresh = function(rows, type, signIndexes, expectedDate) {
  const missing = [];

  for (const index of signIndexes) {
    if (!isTileFresh(rows[index], type.name, expectedDate)) {
      missing.push(`${type.name}/${HOROSCOPES[index].name}`);
    }
  }

  if (missing.length) {
    throw new Error(
      `Daily collage tiles not ready for ${expectedDate}: ${missing.join(', ')}. ` +
      'Wait for schedule-post-daily-tile-image (or pm backup), do not regenerate in post step.'
    );
  }
};

const assertSignTileFresh = function(rows, index, expectedDate) {
  if (isTileFresh(rows[index], 'common', expectedDate)) {
    return;
  }

  throw new Error(
    `Daily sign tile not ready for ${expectedDate}: common/${HOROSCOPES[index].name}. ` +
    'Wait for schedule-post-daily-tile-image (or pm backup).'
  );
};

const resolveDailySlot = function(slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= DAILY_SLOT_COUNT) {
    throw new Error(`postDailyWalls: slot must be 0–${DAILY_SLOT_COUNT - 1}, got ${slot}`);
  }

  if (slot < TYPES.length * COLLAGE_PARTS.length) {
    const part = COLLAGE_PARTS[Math.floor(slot / TYPES.length)];
    const type = TYPES[slot % TYPES.length];

    return {kind: 'collage', part, type};
  }

  return {
    kind: 'sign',
    index: slot - TYPES.length * COLLAGE_PARTS.length
  };
};

const postCollageSlot = async function(rows, type, part, expectedDate) {
  assertCollageTilesFresh(rows, type, part.signIndexes, expectedDate);

  const message = getCollageMessage(type, part.partNumber, expectedDate);
  let existingPost;

  try {
    existingPost = await findExistingWallPost(type.groupId, message);
  } catch (error) {
    console.warn('postDailyWalls: failed to check existing collage post', {
      type: type.name,
      partNumber: part.partNumber,
      code: error.code,
      message: error.message
    });
  }

  if (existingPost) {
    console.log('postDailyWalls: collage already exists', {
      type: type.name,
      partNumber: part.partNumber,
      postId: existingPost.id
    });

    return {post_id: existingPost.id, skipped: true, kind: 'collage'};
  }

  return postWallWithPromo({
    owner_id: type.groupId * -1,
    from_group: 1,
    message,
    attachments: part.signIndexes.map(ind => rows[ind][`${type.name}_image`])
  });
};

const postSignSlot = async function(rows, index, expectedDate) {
  assertSignTileFresh(rows, index, expectedDate);

  const horoscope = HOROSCOPES[index];
  const message = getSignMessage(index, expectedDate, rows);
  const messagePrefix = `Гороскоп на ${expectedDate}`;
  let existingPost;

  try {
    existingPost = await findExistingWallPost(horoscope.groupId, messagePrefix);
  } catch (error) {
    console.warn('postDailyWalls: failed to check existing sign post', {
      sign: horoscope.name,
      code: error.code,
      message: error.message
    });
  }

  if (existingPost) {
    console.log('postDailyWalls: sign post already exists', {
      sign: horoscope.name,
      postId: existingPost.id
    });

    return {post_id: existingPost.id, skipped: true, kind: 'sign'};
  }

  return postWallWithPromo({
    owner_id: horoscope.groupId * -1,
    from_group: 1,
    message,
    attachments: rows[index].common_image
  });
};

/**
 * One wall post per invocation (fits Netlify scheduled ~30s limit).
 * Slots: 0–4 collage part1 by type, 5–9 collage part2, 10–21 sign groups.
 *
 * @param slot {number}
 * @return {Promise<object>}
 */
const postDailyWalls = async function(slot) {
  const expectedDate = getDate();
  const resolved = resolveDailySlot(slot);

  const doc = await getSheetDoc();
  const rows = await doc.sheetsByIndex[0].getRows();

  console.log('postDailyWalls slot', slot, resolved.kind, {
    expectedDate,
    type: resolved.type?.name,
    part: resolved.part?.partNumber,
    sign: resolved.index != null ? HOROSCOPES[resolved.index].name : undefined
  });

  if (resolved.kind === 'collage') {
    return postCollageSlot(rows, resolved.type, resolved.part, expectedDate);
  }

  return postSignSlot(rows, resolved.index, expectedDate);
};

module.exports = postDailyWalls;
module.exports.DAILY_SLOT_COUNT = DAILY_SLOT_COUNT;
module.exports.resolveDailySlot = resolveDailySlot;
