const writeFunctionLog = require('./writeFunctionLog');
const {resolveFunctionLogName} = writeFunctionLog;

const parseBody = function(body) {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    return {raw: String(body).slice(0, 500)};
  }
};

/**
 * @param fn {(event?: object) => Promise<*>}
 * @param options {{ name?: string, minuteKey?: boolean }}
 * @return {(event?: object) => Promise<{statusCode: number, body?: string}>}
 */
const scheduledHandler = function(fn, options = {}) {
  return async function(event) {
    const logName = resolveFunctionLogName(event, options);
    const startedAt = Date.now();

    await writeFunctionLog({
      name: logName,
      status: 'running',
      statusCode: '',
      message: 'started',
      detail: {
        at: new Date().toISOString(),
        query: event?.queryStringParameters || null
      }
    });

    try {
      const result = await fn(event);

      if (result && typeof result === 'object' && 'statusCode' in result) {
        const ok = result.statusCode >= 200 && result.statusCode < 400;
        const body = parseBody(result.body);

        await writeFunctionLog({
          name: logName,
          status: ok ? 'ok' : 'error',
          statusCode: result.statusCode,
          message: ok
            ? (body.ok === false ? 'handler returned error payload' : 'done')
            : (body.error || `HTTP ${result.statusCode}`),
          detail: {
            ms: Date.now() - startedAt,
            body
          }
        });

        return result;
      }

      await writeFunctionLog({
        name: logName,
        status: 'ok',
        statusCode: 200,
        message: 'done',
        detail: {
          ms: Date.now() - startedAt,
          result: result == null ? null : result
        }
      });

      return {statusCode: 200, body: result ? JSON.stringify(result) : ''};
    } catch (error) {
      console.error('Scheduled function failed:', error);

      await writeFunctionLog({
        name: logName,
        status: 'error',
        statusCode: 500,
        message: error.message,
        detail: {
          ms: Date.now() - startedAt,
          code: error.code,
          stack: error.stack ? String(error.stack).split('\n').slice(0, 5).join('\n') : undefined
        }
      });

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
          code: error.code
        })
      };
    }
  };
};

module.exports = scheduledHandler;
