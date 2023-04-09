const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');

const postStep1 = async function(vk, rows) {
  return Promise.all(TYPES.map(async function(type) {
    const response = await vk.api.wall.post({
      owner_id: type.groupId * -1,
      from_group: 1,
      message: `${type.title} на неделю (${rows[0].date}):`,
      attachments: HOROSCOPES.map((h, ind) => rows[ind][`${type.name}_image`])
    });

    return vk.api.wall.pin({
      owner_id: type.groupId * -1,
      post_id: response.post_id
    });
  }));
};

const postStep2 = async function(vk, rows, indexes) {
  return Promise.all(indexes.map(async function(index) {
    const response = await vk.api.wall.post({
      owner_id: HOROSCOPES[index].groupId * -1,
      from_group: 1,
      message: `Гороскоп на неделю (${rows[0].date}):\n
&#10084; Любовь: ${rows[index].love}\n
&#9752; Здоровье: ${rows[index].health}\n
&#128176; Бизнес: ${rows[index].business}\n
&#128139; Постель: ${rows[index].erotic}\n
#гороскоп #${HOROSCOPES[index].title.toLowerCase()} #любовь #здоровье #бизнес #постель`,
      attachments: rows[index][`common_image`]
    });

    return vk.api.wall.pin({
      owner_id: HOROSCOPES[index].groupId * -1,
      post_id: response.post_id
    });
  }));
};

/**
 * @param stepNumber {Number}
 * @return {Promise<Awaited<*>[]>}
 */
const postWeeklyWalls = async function(stepNumber) {
  const vk = new VK({token: process.env.VK_API_TOKEN});

  const doc = await getSheetDoc();
  const sheet = doc.sheetsById[1404558085];
  const rows = await sheet.getRows();

  if (stepNumber === 1) {
    return await postStep1(vk, rows);
  }

  if (stepNumber === 2) {
    return await postStep2(vk, rows, [0, 1, 2, 3, 4, 5]);
  }

  if (stepNumber === 3) {
    return await postStep2(vk, rows, [6, 7, 8, 9, 10, 11]);
  }
};

module.exports = postWeeklyWalls;
