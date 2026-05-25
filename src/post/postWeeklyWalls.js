const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');
const postWallWithPromo = require('./postWallWithPromo');
const ensureWeeklyTiles = require('./ensureWeeklyTiles');
const ensureWeeklyBgImages = require('./ensureWeeklyBgImages');
const pinWallPost = require('./pinWallPost');
const {extractPostId} = pinWallPost;

const buildWeeklyPostGuid = function(scope, weeklyDate) {
  const dateKey = String(weeklyDate).replace(/\s+/g, '-');
  return `vkhoro-${scope}-${dateKey}`.slice(0, 32);
};

const assertWeeklyBgImages = function(rows) {
  const missing = TYPES
    .filter(type => !rows[0][`${type.name}_bg_image`])
    .map(type => type.name);

  if (missing.length) {
    throw new Error(`Weekly summary: missing bg images for ${missing.join(', ')}`);
  }
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

const postTypeGroupSummaries = async function(rows) {
  const weeklyDate = rows[0].date;

  return Promise.all(TYPES.map(type => postWallWithPromoAndPin({
    owner_id: type.groupId * -1,
    from_group: 1,
    message: `Гороскоп на неделю (${weeklyDate}):\n
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
&#9811; Рыбы\n${rows[11][type.name]}`,
    attachments: rows[0][`${type.name}_bg_image`],
    guid: buildWeeklyPostGuid(`weekly-${type.name}-summary`, weeklyDate)
  }, type.groupId)));
};

const postSignGroupWeekly = async function(rows, indexes) {
  const weeklyDate = rows[0].date;

  return Promise.all(indexes.map(index => postWallWithPromoAndPin({
    owner_id: HOROSCOPES[index].groupId * -1,
    from_group: 1,
    message: `Гороскоп на неделю (${weeklyDate}):\n
&#10084; Любовь: ${rows[index].love}\n
&#9752; Здоровье: ${rows[index].health}\n
&#128176; Бизнес: ${rows[index].business}\n
&#128139; Постель: ${rows[index].erotic}\n
#гороскоп #${HOROSCOPES[index].title.toLowerCase()} #любовь #здоровье #бизнес #постель`,
    attachments: rows[index].common_image,
    guid: buildWeeklyPostGuid(`weekly-sign-${HOROSCOPES[index].name}`, weeklyDate)
  }, HOROSCOPES[index].groupId)));
};

const SIGN_PART_1 = [0, 1, 2, 3, 4, 5];
const SIGN_PART_2 = [6, 7, 8, 9, 10, 11];

/**
 * @param stepNumber {Number} 1–3 (see schedule-post-weekly-horo-step-*)
 * @return {Promise<Awaited<*>[]>}
 */
const postWeeklyWalls = async function(stepNumber) {
  const uploadVk = new VK({token: process.env.VK_API_TOKEN});

  const doc = await getSheetDoc();
  const sheet = doc.sheetsById[1404558085];
  let rows = await sheet.getRows();

  if (stepNumber === 1) {
    rows = await ensureWeeklyBgImages(rows);
    assertWeeklyBgImages(rows);

    const failed = await ensureWeeklyTiles(uploadVk, rows);

    if (failed.length) {
      console.warn('postWeeklyWalls step 1: tile regeneration failures', failed);
    }

    return await postTypeGroupSummaries(rows);
  }

  if (stepNumber === 2) {
    await ensureWeeklyTiles(uploadVk, rows);
    return await postSignGroupWeekly(rows, SIGN_PART_1);
  }

  if (stepNumber === 3) {
    await ensureWeeklyTiles(uploadVk, rows);
    return await postSignGroupWeekly(rows, SIGN_PART_2);
  }

  throw new Error(`postWeeklyWalls: unknown step ${stepNumber}`);
};

module.exports = postWeeklyWalls;
