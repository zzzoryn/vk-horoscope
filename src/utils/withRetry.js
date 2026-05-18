/**
 * @param fn {() => Promise<*>}
 * @param attempts {number}
 * @param delayMs {number}
 * @return {Promise<*>}
 */
const withRetry = async function(fn, attempts = 3, delayMs = 1000) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
};

module.exports = withRetry;
