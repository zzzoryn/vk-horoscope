const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');
const getDate = require('../utils/getDate');
const postWallWithPromo = require('./postWallWithPromo');
const buildPostGuid = postWallWithPromo.buildPostGuid;
const ensureDailyTiles = require('./ensureDailyTiles');

const COLLAGE_PART_1 = [0, 1, 2, 3, 4, 5];
const COLLAGE_PART_2 = [6, 7, 8, 9, 10, 11];

const postCollagePart = async function(rows, signIndexes, partNumber) {
  return Promise.all(TYPES.map(type => postWallWithPromo({
    owner_id: type.groupId * -1,
    from_group: 1,
    message: `${type.title} на ${getDate()} (Часть ${partNumber}):`,
    attachments: signIndexes.map(ind => rows[ind][`${type.name}_image`]),
    guid: buildPostGuid(`${type.name}-collage-${partNumber}`)
  })));
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
 * @param stepNumber {Number} 1–4 per schedule-post-daily-horo cron (minutes 0,5,10,15)
 * @return {Promise<Awaited<*>[]>}
 */
const postDailyWalls = async function(stepNumber) {
  const uploadVk = new VK({token: process.env.VK_API_TOKEN});
  const expectedDate = getDate();

  const doc = await getSheetDoc();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  if (stepNumber === 1) {
    await ensureDailyTiles(uploadVk, rows, COLLAGE_PART_1, expectedDate);
    return await postCollagePart(rows, COLLAGE_PART_1, 1);
  }

  if (stepNumber === 2) {
    await ensureDailyTiles(uploadVk, rows, COLLAGE_PART_2, expectedDate);
    return await postCollagePart(rows, COLLAGE_PART_2, 2);
  }

  if (stepNumber === 3) {
    await ensureDailyTiles(uploadVk, rows, COLLAGE_PART_1, expectedDate);
    return await postSignPosts(rows, COLLAGE_PART_1);
  }

  if (stepNumber === 4) {
    await ensureDailyTiles(uploadVk, rows, COLLAGE_PART_2, expectedDate);
    return await postSignPosts(rows, COLLAGE_PART_2);
  }
};

module.exports = postDailyWalls;
