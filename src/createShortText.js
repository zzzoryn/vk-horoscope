const createShortText = function(text) {
  let shortText = text.replace(/\n[\s\S]+$/, '');
  if (shortText.length < 230) {
    return shortText;
  }

  let stop = false;
  let shortTextArr = shortText.split('. ');

  shortText = '';

  shortTextArr.forEach(item => {
    if (!stop) {
      let p = item + '. ';
      if ((shortText + p).length < 240) {
        shortText = shortText + p;
      }
      else {
        stop = true;
      }
    }
  });

  return shortText;
};

module.exports = createShortText;
