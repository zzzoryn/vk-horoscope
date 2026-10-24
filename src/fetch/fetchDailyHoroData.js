const xml2js = require('xml2js');

const getSheetDoc = require('../utils/getSheetDoc');
const asyncFetch = require('../utils/asyncFetch');
const getDate = require('../utils/getDate');
const {
  DAILY_COMMON_HORO_XML_URL,
  DAILY_BUSINESS_HORO_XML_URL,
  DAILY_LOVE_HORO_XML_URL,
  DAILY_HEALTH_HORO_XML_URL,
  DAILY_EROTIC_HORO_XML_URL,
  TYPES,
  MONTHS
} = require('../constants');

const IGNIO_DAY_KEYS = ['yesterday', 'today', 'tomorrow', 'tomorrow02'];

/**
 * Convert ignio attr "25.10.2026" → "25 октября"
 * @param attr {string}
 * @return {string}
 */
const formatIgnioAttr = function(attr) {
  const parts = String(attr || '').split('.');
  const day = Number(parts[0]);
  const month = Number(parts[1]);

  if (!day || !month || month < 1 || month > 12) {
    return '';
  }

  return `${day} ${MONTHS[month - 1]}`;
};

/**
 * Pick yesterday/today/tomorrow/tomorrow02 that matches our target label.
 * Evening runs may not align with a hardcoded "tomorrow" node.
 *
 * @param dateAttrs {{[key: string]: string}}
 * @param expectedDate {string}
 * @return {string}
 */
const resolveIgnioDayKey = function(dateAttrs, expectedDate) {
  for (const key of IGNIO_DAY_KEYS) {
    if (formatIgnioAttr(dateAttrs[key]) === expectedDate) {
      return key;
    }
  }

  console.warn('fetchDailyHoroData: no ignio day matched expectedDate, fallback tomorrow', {
    expectedDate,
    dateAttrs
  });

  return 'tomorrow';
};

const fetchDailyHoroData = async function() {
  const expectedDate = getDate();
  const doc = await getSheetDoc();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const parser = new xml2js.Parser({});
  const dailyHoroscopes = await Promise.all([
    asyncFetch(DAILY_COMMON_HORO_XML_URL),
    asyncFetch(DAILY_BUSINESS_HORO_XML_URL),
    asyncFetch(DAILY_LOVE_HORO_XML_URL),
    asyncFetch(DAILY_HEALTH_HORO_XML_URL),
    asyncFetch(DAILY_EROTIC_HORO_XML_URL)
  ]).then(async responses => {
    return await Promise.all(responses.map(res => parser.parseStringPromise(res.toString())));
  });

  const dateAttrs = dailyHoroscopes[0].horo.date[0].$ || {};
  const dayKey = resolveIgnioDayKey(dateAttrs, expectedDate);

  console.log('fetchDailyHoroData', {expectedDate, dayKey, dateAttrs});

  for (const row of rows) {
    row.content_date = expectedDate;

    for (const ind in TYPES) {
      const signNode = dailyHoroscopes[ind].horo[row.name][0];
      const textNode = signNode[dayKey] || signNode.tomorrow;
      row[TYPES[ind].name] = String(textNode[0]).replace(/[\n\r]/g, '');
    }
  }

  await Promise.all(rows.map(row => row.save()));
};

module.exports = fetchDailyHoroData;
module.exports.resolveIgnioDayKey = resolveIgnioDayKey;
module.exports.formatIgnioAttr = formatIgnioAttr;
