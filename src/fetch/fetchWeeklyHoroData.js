const xml2js = require('xml2js');

const getSheetDoc = require('../utils/getSheetDoc');
const asyncFetch = require('../utils/asyncFetch');
const {WEEKLY_HORO_XML_URL, HOROSCOPES, TYPES} = require('../constants');

const fetchWeeklyHoroData = async function() {
  const doc = await getSheetDoc();
  const sheet = doc.sheetsById[1404558085];
  const rows = await sheet.getRows();

  const parser = new xml2js.Parser({});
  const weeklyHoroscope = await asyncFetch(WEEKLY_HORO_XML_URL).then(async responses => {
    return await parser.parseStringPromise(responses.toString());
  });

  HOROSCOPES.forEach(({name}, i) => {
    for (type of TYPES) {
      rows[i][type.name] = weeklyHoroscope.horo[name][0][type.name][0].replace(/[\n\r]/g, '');
    }
  });

  await Promise.all(rows.map(row => row.save()));
};

module.exports = fetchWeeklyHoroData;
