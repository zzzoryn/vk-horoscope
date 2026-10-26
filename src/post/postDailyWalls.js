const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');
const getDate = require('../utils/getDate');
const postWallWithPromo = require('./postWallWithPromo');
const buildPostGuid = postWallWithPromo.buildPostGuid;
const {isTileFresh} = require('./tileFreshness');
const findExistingWallPost = require('./findExistingWallPost');

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

const lookupExistingOrThrow = async function(groupId, messagePrefix, meta) {
  try {
    return await findExistingWallPost(groupId, messagePrefix);
  } catch (error) {
    console.error('postDailyWalls: existing-post check failed', {
      ...meta,
      code: error.code,
      message: error.message
    });
    // Fail closed: do not post if we cannot prove the wall is clear (avoids duplicates).
    throw error;
  }
};

const postCollageSlot = async function(rows, type, part, expectedDate) {
  assertCollageTilesFresh(rows, type, part.signIndexes, expectedDate);

  const message = getCollageMessage(type, part.partNumber, expectedDate);
  const existingPost = await lookupExistingOrThrow(type.groupId, message, {
    kind: 'collage',
    type: type.name,
    partNumber: part.partNumber
  });

  if (existingPost) {
    console.log('postDailyWalls: collage already exists', {
      type: type.name,
      partNumber: part.partNumber,
      postId: existingPost.id
    });

    return {
      post_id: existingPost.id,
      owner_id: type.groupId * -1,
      wall_url: `https://vk.com/wall-${type.groupId}_${existingPost.id}`,
      skipped: true,
      kind: 'collage'
    };
  }

  return postWallWithPromo({
    owner_id: type.groupId * -1,
    from_group: 1,
    message,
    attachments: part.signIndexes.map(ind => rows[ind][`${type.name}_image`]),
    guid: buildPostGuid(`c-${type.name}-${part.partNumber}`, expectedDate)
  });
};

const postSignSlot = async function(rows, index, expectedDate) {
  assertSignTileFresh(rows, index, expectedDate);

  const horoscope = HOROSCOPES[index];
  const message = getSignMessage(index, expectedDate, rows);
  const messagePrefix = `Гороскоп на ${expectedDate}`;
  const existingPost = await lookupExistingOrThrow(horoscope.groupId, messagePrefix, {
    kind: 'sign',
    sign: horoscope.name
  });

  if (existingPost) {
    console.log('postDailyWalls: sign post already exists', {
      sign: horoscope.name,
      postId: existingPost.id
    });

    return {
      post_id: existingPost.id,
      owner_id: horoscope.groupId * -1,
      wall_url: `https://vk.com/wall-${horoscope.groupId}_${existingPost.id}`,
      skipped: true,
      kind: 'sign'
    };
  }

  return postWallWithPromo({
    owner_id: horoscope.groupId * -1,
    from_group: 1,
    message,
    attachments: rows[index].common_image,
    guid: buildPostGuid(`s-${horoscope.name}`, expectedDate)
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
  const resolved = resolveDailySlot(slot);

  const doc = await getSheetDoc();
  const rows = await doc.sheetsByIndex[0].getRows();

  // Prefer sheet content_date so next-day manual catch-up still posts for the
  // prepared day (evening fetch has not overwritten the sheet yet).
  const expectedDate = rows[0]?.content_date || getDate();

  console.log('postDailyWalls slot', slot, resolved.kind, {
    expectedDate,
    contentDate: rows[0]?.content_date,
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
