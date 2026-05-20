/**
 * @param fn {() => Promise<*>}
 * @return {() => Promise<{statusCode: number, body?: string}>}
 */
const scheduledHandler = function(fn) {
  return async function() {
    try {
      const result = await fn();

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
