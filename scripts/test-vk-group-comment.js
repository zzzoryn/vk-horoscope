require('dotenv').config();

const {getVkForGroup, loadGroupTokens} = require('../src/utils/getVkGroupToken');
const {HOROSCOPES} = require('../src/constants');

const groupId = process.argv[2] || String(HOROSCOPES[0].groupId);

(async function() {
  const tokens = loadGroupTokens();

  if (!Object.keys(tokens).length) {
    console.error('VK_GROUP_TOKENS is empty. Run: node scripts/vk-group-tokens-template.js');
    process.exit(1);
  }

  const vk = getVkForGroup(groupId);
  const group = await vk.api.groups.getById({group_id: groupId});

  console.log('OK community token for group', groupId, '→', group[0].name);
})().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
