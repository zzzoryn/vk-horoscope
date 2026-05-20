require('dotenv').config();

const {getGoogleCredentials} = require('../src/utils/getSheetDoc');

try {
  const creds = getGoogleCredentials();

  console.log('OK Google credentials');
  console.log('client_email:', creds.client_email);
  console.log('private_key:', creds.private_key.split('\n')[0], '...');
} catch (error) {
  console.error(error.message || error);
  console.error('\nTip: download JSON from Google Cloud → set in .env:');
  console.error('  GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json');
  console.error('  GOOGLE_SHEET_ID=your_sheet_id');
  process.exit(1);
}
