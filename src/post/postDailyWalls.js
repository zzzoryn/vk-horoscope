const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');
const getDate = require('../utils/getDate');
const postWallWithPromo = require('./postWallWithPromo');
const buildPostGuid = postWallWithPromo.buildPostGuid;
const ensureDailyTiles = require('./ensureDailyTiles');
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

const maxTilesForSigns = signIndexes => signIndexes.length * TYPES.length;

const assertCollageAttachments = function(rows, signIndexes, partNumber) {
  const missing = [];

  for (const type of TYPES) {
    for (const index of signIndexes) {
      const attachment = rows[index][`${type.name}_image`];

      if (!attachment) {
        missing.push(`${type.name}/${HOROSCOPES[index].name}`);
      }
    }
  }

  if (missing.length) {
    throw new Error(
      `Collage part ${partNumber}: missing tile attachments: ${missing.join(', ')}`
    );
  }
};

const getCollageMessage = function(type, partNumber, date) {
  return `${type.title} на ${date} (Часть ${partNumber}):`;
};

const getWallItems = function(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.items || [];
};

const findExistingCollagePost = async function(type, partNumber, date) {
  const groupVk = await getVkForGroup(type.groupId);
  const message = getCollageMessage(type, partNumber, date);
  const response = await groupVk.api.wall.get({
    owner_id: type.groupId * -1,
    filter: 'owner',
    count: 50
  });

  return getWallItems(response).find(post => String(post.message || '').startsWith(message));
};

const ensureAndPostCollagePart = async function(uploadVk, rows, part, expectedDate) {
  const failed = await ensureDailyTiles(uploadVk, rows, part.signIndexes, expectedDate, {
    maxRegenerations: maxTilesForSigns(part.signIndexes)
  });

  if (failed.length) {
    console.warn(`postDailyWalls collage part ${part.partNumber}: tile regeneration failures`, failed);
  }

  assertCollageAttachments(rows, part.signIndexes, part.partNumber);

  return Promise.all(TYPES.map(async type => {
    let existingPost;

    try {
      existingPost = await findExistingCollagePost(type, part.partNumber, expectedDate);
    } catch (error) {
      console.warn('postDailyWalls: failed to check existing collage post', {
        type: type.name,
        partNumber: part.partNumber,
        code: error.code,
        message: error.message
      });
    }

    if (existingPost) {
      console.log('postDailyWalls: collage part already exists', {
        type: type.name,
        partNumber: part.partNumber,
        postId: existingPost.id
      });

      return {
        post_id: existingPost.id,
        skipped: true
      };
    }

    return postWallWithPromo({
      owner_id: type.groupId * -1,
      from_group: 1,
      message: getCollageMessage(type, part.partNumber, expectedDate),
      attachments: part.signIndexes.map(ind => rows[ind][`${type.name}_image`]),
      guid: buildPostGuid(`${type.name}-collage-${part.partNumber}`)
    });
  }));
};

const postCollageParts = async function(uploadVk, rows, expectedDate, primaryPartNumber) {
  const orderedParts = COLLAGE_PARTS.slice().sort(part => {
    if (part.partNumber === primaryPartNumber) {
      return -1;
    }

    return 1;
  });
  const results = [];

  for (const part of orderedParts) {
    results.push(await ensureAndPostCollagePart(uploadVk, rows, part, expectedDate));
  }

  return results.flat();
};

const postSignPosts = async function(rows, indexes) {
  return Promise.all(indexes.map(index => postWallWithPromo({
    owner_id: HOROSCOPES[index].groupId * -1,
    from_group: 1,
    message: `Гороскоп на ${getDate()}\n
&#10084; Любовь: ${rows[index].love}\n
&#9752; Здоровье: ${rows[index].health}\n
&#128176; Бизнес: ${rows[index].business}\n
&#128139; Постель: ${rows[index].erotic}\n
#гороскоп #${HOROSCOPES[index].title.toLowerCase()} #любовь #здоровье #бизнес #постель`,
    attachments: rows[index][`common_image`],
    guid: buildPostGuid(`sign-${HOROSCOPES[index].name}`)
  })));
};

/**
 * @param stepNumber {Number} 1–4 (see schedule-post-daily-horo-step-*)
 * @return {Promise<Awaited<*>[]>}
 */
const postDailyWalls = async function(stepNumber) {
  const uploadVk = new VK({token: process.env.VK_API_TOKEN});
  const expectedDate = getDate();

  const doc = await getSheetDoc();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  if (stepNumber === 1) {
    return await postCollageParts(uploadVk, rows, expectedDate, 1);
  }

  if (stepNumber === 2) {
    return await postCollageParts(uploadVk, rows, expectedDate, 2);
  }

  if (stepNumber === 3) {
    await ensureDailyTiles(uploadVk, rows, COLLAGE_PART_1, expectedDate);
    return await postSignPosts(rows, COLLAGE_PART_1);
  }

  if (stepNumber === 4) {
    await ensureDailyTiles(uploadVk, rows, COLLAGE_PART_2, expectedDate);
    return await postSignPosts(rows, COLLAGE_PART_2);
  }

  throw new Error(`postDailyWalls: unknown step ${stepNumber}`);
};

module.exports = postDailyWalls;
