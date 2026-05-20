const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {GoogleSpreadsheet} = require('google-spreadsheet');

const PEM_HEADERS = ['PRIVATE KEY', 'RSA PRIVATE KEY', 'EC PRIVATE KEY'];

const stripQuotes = function(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const wrapPemBody = function(pemType, body) {
  const begin = `-----BEGIN ${pemType}-----`;
  const end = `-----END ${pemType}-----`;
  const compact = body.replace(/\s/g, '');
  const lines = compact.match(/.{1,64}/g) || [];

  return `${begin}\n${lines.join('\n')}\n${end}\n`;
};

const normalizePrivateKey = function(key) {
  let normalized = stripQuotes(key)
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (!normalized) {
    throw new Error('GOOGLE_PRIVATE_KEY is empty');
  }

  for (const pemType of PEM_HEADERS) {
    const begin = `-----BEGIN ${pemType}-----`;
    const end = `-----END ${pemType}-----`;

    if (!normalized.includes(begin)) {
      continue;
    }

    if (!normalized.includes('\n')) {
      const start = normalized.indexOf(begin);
      const finish = normalized.indexOf(end);

      if (finish > start) {
        normalized = wrapPemBody(pemType, normalized.slice(start + begin.length, finish));
      }
    }

    break;
  }

  try {
    crypto.createPrivateKey(normalized);
    return normalized;
  } catch (error) {
    throw new Error(
      `GOOGLE_PRIVATE_KEY is invalid (${error.message}). ` +
      'Prefer GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json (path to the key file from Google Cloud).'
    );
  }
};

const getGoogleCredentials = function() {
  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (jsonPath) {
    const fullPath = path.resolve(jsonPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`GOOGLE_SERVICE_ACCOUNT_JSON not found: ${fullPath}`);
    }

    const creds = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    if (!creds.client_email || !creds.private_key) {
      throw new Error(`Invalid service account JSON (need client_email, private_key): ${fullPath}`);
    }

    return {
      client_email: creds.client_email,
      private_key: creds.private_key
    };
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error(
      'Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY, or GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json'
    );
  }

  return {
    client_email: email,
    private_key: normalizePrivateKey(key)
  };
};

const getSheetDoc = async function() {
  const creds = getGoogleCredentials();
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: creds.client_email,
    private_key: creds.private_key
  });

  await doc.loadInfo();
  return doc;
};

module.exports = getSheetDoc;
module.exports.getGoogleCredentials = getGoogleCredentials;
module.exports.normalizePrivateKey = normalizePrivateKey;
