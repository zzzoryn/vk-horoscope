/**
 * @param fn {(event?: object) => Promise<*>}
 * @return {(event?: object) => Promise<{statusCode: number, body?: string}>}
 */
const scheduledHandler = function(fn) {
  return async function(event) {
    try {
      const result = await fn(event);

      if (result && typeof result === 'object' && 'statusCode' in result) {
        return result;
      }

      return {statusCode: 200, body: result ? JSON.stringify(result) : ''};
    } catch (error) {
      console.error('Scheduled function failed:', error);

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
