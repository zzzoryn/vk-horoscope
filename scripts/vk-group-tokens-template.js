const {TYPES, HOROSCOPES} = require('../src/constants');

const ids = new Set();

TYPES.forEach(type => ids.add(type.groupId));
HOROSCOPES.forEach(item => ids.add(item.groupId));

const template = {};

[...ids].sort((a, b) => a - b).forEach(id => {
  template[id] = 'PASTE_COMMUNITY_KEY_HERE';
});

console.log('Add to .env / Netlify as VK_GROUP_TOKENS (one-line JSON):\n');
console.log(JSON.stringify(template));
