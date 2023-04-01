const xml2js = require('xml2js');

const getSheetDoc = require('../utils/getSheetDoc');
const asyncFetch = require('../utils/asyncFetch');
const {
        DAILY_COMMON_HORO_XML_URL,
        DAILY_BUSINESS_HORO_XML_URL,
        DAILY_LOVE_HORO_XML_URL,
        DAILY_HEALTH_HORO_XML_URL,
        DAILY_EROTIC_HORO_XML_URL,
        DAILY_ANTI_HORO_XML_URL
      } = require('../constants');

const fetchDailyHoroData = async function () {
  const doc = await getSheetDoc();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const parser = new xml2js.Parser({});
  const dailyHoroscopes = await Promise.all([
    asyncFetch(DAILY_COMMON_HORO_XML_URL),
    asyncFetch(DAILY_BUSINESS_HORO_XML_URL),
    asyncFetch(DAILY_LOVE_HORO_XML_URL),
    asyncFetch(DAILY_HEALTH_HORO_XML_URL),
    asyncFetch(DAILY_EROTIC_HORO_XML_URL),
    asyncFetch(DAILY_ANTI_HORO_XML_URL)
  ]).then(async responses => {
    return await Promise.all(responses.map(res => parser.parseStringPromise(res.toString())));
  });

  const types = ['common', 'business', 'love', 'health', 'erotic', 'anti'];

  for (const row of rows) {
    for (const ind in types) {
      row[types[ind]] = dailyHoroscopes[ind].horo[row.name][0].tomorrow[0].replace(/[\n\r]/g, '');
    }
  }

  await Promise.all(rows.map(row => row.save()));
}

module.exports = fetchDailyHoroData;
