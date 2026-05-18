const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');
const getDate = require('../utils/getDate');
const postWallWithPromo = require('./postWallWithPromo');
const ensureDailyTiles = require('./ensureDailyTiles');

const postStep1 = async function(vk, rows) {
  return Promise.all(TYPES.map(type => postWallWithPromo(vk, {
    owner_id: type.groupId * -1,
    from_group: 1,
    message: `${type.title} на ${getDate()} (Часть 2):`,
    attachments: [6, 7, 8, 9, 10, 11].map(ind => rows[ind][`${type.name}_image`])
  })));
};

const postStep2 = async function(vk, rows) {
  return Promise.all(TYPES.map(type => postWallWithPromo(vk, {
    owner_id: type.groupId * -1,
    from_group: 1,
    message: `${type.title} на ${getDate()} (Часть 1):`,
    attachments: [0, 1, 2, 3, 4, 5].map(ind => rows[ind][`${type.name}_image`])
  })));
};

const postStep3 = async function(vk, rows, indexes) {
  return Promise.all(indexes.map(index => postWallWithPromo(vk, {
    owner_id: HOROSCOPES[index].groupId * -1,
    from_group: 1,
    message: `Гороскоп на ${getDate()}\n
&#10084; Любовь: ${rows[index].love}\n
&#9752; Здоровье: ${rows[index].health}\n
&#128176; Бизнес: ${rows[index].business}\n
&#128139; Постель: ${rows[index].erotic}\n
#гороскоп #${HOROSCOPES[index].title.toLowerCase()} #любовь #здоровье #бизнес #постель`,
    attachments: rows[index][`common_image`]
  })));
};

/**
 * @param stepNumber {Number}
 * @return {Promise<Awaited<*>[]>}
 */
const postDailyWalls = async function(stepNumber) {
  const vk = new VK({token: process.env.VK_API_TOKEN});
  const expectedDate = getDate();

  const doc = await getSheetDoc();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  if (stepNumber === 1) {
    await ensureDailyTiles(vk, rows, [6, 7, 8, 9, 10, 11], expectedDate);
    return await postStep1(vk, rows);
  }

  if (stepNumber === 2) {
    await ensureDailyTiles(vk, rows, [0, 1, 2, 3, 4, 5], expectedDate);
    return await postStep2(vk, rows);
  }

  if (stepNumber === 3) {
    return await postStep3(vk, rows, [0, 1, 2, 3, 4, 5]);
  }

  if (stepNumber === 4) {
    return await postStep3(vk, rows, [6, 7, 8, 9, 10, 11]);
  }
};

module.exports = postDailyWalls;
