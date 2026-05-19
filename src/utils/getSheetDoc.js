const {GoogleSpreadsheet} = require('google-spreadsheet');

const normalizePrivateKey = function(key) {
  let normalized = key.replace(/\\n/g, '\n').trim();

  if (normalized.includes('\n')) {
    return normalized;
  }

  const match = normalized.match(/-----BEGIN PRIVATE KEY-----(.+)-----END PRIVATE KEY-----/);

  if (!match) {
    return normalized;
  }

  const body = match[1].replace(/\s/g, '');
  const lines = body.match(/.{1,64}/g) || [];

  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----\n`;
};

const getSheetDoc = async function() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY)
  });

  await doc.loadInfo();
  return doc;
};

module.exports = getSheetDoc;
