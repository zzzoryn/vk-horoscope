const jsdom = require('jsdom');
const dom = new jsdom.JSDOM('');
const $ = require('jquery')(dom.window);
const createShortText = require('./createShortText');
const asyncFetch = require('./asyncFetch');

const getHoroData = async function (name, date, allData) {
  const documentResponse = await asyncFetch(`https://horo.mail.ru/prediction/${name}/tomorrow/`);
  const $document = $(documentResponse.toString());
  const $textParagraphs = $document.find('.article__item.article__item_alignment_left.article__item_html p');
  const text = Array.from($textParagraphs).map(element => $(element).text()).join('\n\n');
  const $values = $document.find('.p-score-day__item__value__inner');
  const business = $values.eq(0).text();
  const love = $values.eq(1).text();
  const value = $values.eq(2).text();

  let shortText = '';

  try {
    shortText = allData.horo[name][0].tomorrow[0].replace(/[\n\r]/g, '');
  }
  catch (err) {
    console.log(err);
  }

  shortText = shortText && shortText.length < 240 ? shortText : createShortText(shortText || text);

  return {name, shortText, text, business, love, value, date};
}

module.exports = getHoroData;
