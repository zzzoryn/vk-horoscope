const {MONTHS} = require('../constants');

/**
 * Convert sheet date labels to ASCII guid fragments.
 * "25 октября" → "25-10"
 * "19 - 25 октября" → "19-25-10"
 *
 * @param dateLabel {string}
 * @return {string}
 */
const asciiDateKey = function(dateLabel) {
  const text = String(dateLabel || '').trim().toLowerCase();
  const monthIndex = MONTHS.findIndex(month => text.includes(month));
  const days = text.match(/\d+/g) || [];
  const month = monthIndex >= 0 ? String(monthIndex + 1).padStart(2, '0') : '00';

  if (days.length >= 2) {
    return `${days[0]}-${days[1]}-${month}`;
  }

  if (days.length === 1) {
    return `${days[0]}-${month}`;
  }

  const fallback = text.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return fallback.slice(0, 16) || 'na';
};

module.exports = asciiDateKey;
