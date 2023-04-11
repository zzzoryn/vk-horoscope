const {VK} = require('vk-io');
const getSheetDoc = require('../utils/getSheetDoc');
const {TYPES, HOROSCOPES} = require('../constants');

const postStep1 = async function(vk, rows) {
  return Promise.all(TYPES.map(async function(type) {
    const response = await vk.api.wall.post({
      owner_id: type.groupId * -1,
      from_group: 1,
      message: `Гороскоп на неделю (${rows[0].date}):\n
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
      attachments: rows[0][`${type.name}_bg_image`]
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
