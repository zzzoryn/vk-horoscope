require('dotenv').config();

const getSheetDoc = require('../src/utils/getSheetDoc');

const sheetTitle = process.env.VK_GROUP_TOKENS_SHEET || 'group_tokens';
const raw = process.env.VK_GROUP_TOKENS;

(async function() {
  if (!raw) {
    console.error('VK_GROUP_TOKENS is empty in .env — nothing to push.');
    process.exit(1);
  }

  JSON.parse(raw);

  const doc = await getSheetDoc();
  let sheet = doc.sheetsByTitle[sheetTitle];

  if (!sheet) {
    sheet = await doc.addSheet({title: sheetTitle});
    console.log('Created sheet tab:', sheetTitle);
  }

  await sheet.loadCells('A1');
  sheet.getCell(0, 0).value = raw.trim();
  await sheet.saveUpdatedCells();

  console.log('Saved VK_GROUP_TOKENS to', sheetTitle + '!A1');
  console.log('Remove VK_GROUP_TOKENS from Netlify env vars (Lambda 4KB limit).');
})().catch(function(error) {
  console.error(error.message || error);
  process.exit(1);
});
