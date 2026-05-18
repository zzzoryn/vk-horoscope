// Google Sheet: add columns common_image_date, business_image_date, love_image_date,
// health_image_date, erotic_image_date (one per horoscope row).

const imageDateKey = type => `${type}_image_date`;

const isTileFresh = function(row, type, expectedDate) {
  return row[imageDateKey(type)] === expectedDate && Boolean(row[`${type}_image`]);
};

module.exports = {
  imageDateKey,
  isTileFresh
};
