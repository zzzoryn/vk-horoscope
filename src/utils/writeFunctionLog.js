const getSheetDoc = require('./getSheetDoc');

const LOGS_SHEET = process.env.FUNCTION_LOGS_SHEET || 'logs';

const truncate = function(value, max) {
  const text = value == null ? '' : String(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/**
 * Upsert one row in the "logs" sheet (headers must exist):
 * function | updated_at | status | status_code | message | detail
 *
 * Create a tab named `logs` (or set FUNCTION_LOGS_SHEET). Logging never throws.
 *
 * @param entry {{
 *   name: string,
 *   status: string,
 *   statusCode?: number,
 *   message?: string,
 *   detail?: *
 * }}
 * @return {Promise<void>}
 */
const writeFunctionLog = async function(entry) {
  try {
    const doc = await getSheetDoc();
    const sheet = doc.sheetsByTitle[LOGS_SHEET];

    if (!sheet) {
      console.warn(
        `writeFunctionLog: sheet "${LOGS_SHEET}" not found. ` +
        'Create a tab with headers: function, updated_at, status, status_code, message, detail'
      );
      return;
    }

    const rows = await sheet.getRows();
    const existing = rows.find(row => String(row.function || '') === entry.name);
    const payload = {
      function: entry.name,
      updated_at: new Date().toISOString(),
      status: entry.status,
      status_code: entry.statusCode == null ? '' : String(entry.statusCode),
      message: truncate(entry.message, 500),
      detail: truncate(
        typeof entry.detail === 'string'
          ? entry.detail
          : JSON.stringify(entry.detail == null ? {} : entry.detail),
        2000
      )
    };

    if (existing) {
      existing.function = payload.function;
      existing.updated_at = payload.updated_at;
      existing.status = payload.status;
      existing.status_code = payload.status_code;
      existing.message = payload.message;
      existing.detail = payload.detail;
      await existing.save();
      return;
    }

    await sheet.addRow(payload);
  } catch (error) {
    console.warn('writeFunctionLog failed:', error.message);
  }
};

/**
 * Build a stable log row key for Netlify functions (one row per function or per slot).
 *
 * @param event {object=}
 * @return {string}
 */
const resolveFunctionLogName = function(event) {
  const base = process.env.AWS_LAMBDA_FUNCTION_NAME || 'function';
  const params = event?.queryStringParameters || {};

  if (params.slot != null && params.slot !== '') {
    return `${base}#slot=${params.slot}`;
  }

  if (params.sign) {
    return `${base}#sign=${params.sign}`;
  }

  if (params.bg) {
    return `${base}#bg=${params.bg}`;
  }

  if (/(tile-image|daily-horo|weekly-horo)/.test(base)) {
    return `${base}#m=${new Date().getUTCMinutes()}`;
  }

  return base;
};

module.exports = writeFunctionLog;
module.exports.resolveFunctionLogName = resolveFunctionLogName;
module.exports.LOGS_SHEET = LOGS_SHEET;
