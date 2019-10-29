const isThenable = obj =>
  typeof obj === 'object' && typeof obj.then === 'function';

/**
 * Handles calling success and error callbacks once for when a function (`fn`) can return a promise or use callbacks.
 * If `fn` uses both callbacks and returns a promise, the callbacks are used and the promise resolves with undefined - even if the error callback is called.
 * @param {Object} options
 * @param {(...args: any[], onSuccess: () => {}, onError: () => {}) => any} options.fn The function to call asynchronously. Should accept onSuccess and onError callbacks as its last two params.
 * @param {Array} options.args Arguments to pass to `fn` before the onSuccess and onError params.
 * @param {Function} [options.success] Callback to run on success of `fn`. Whatever is returned from `options.success` will be the result of the promise.
 * @param {Function} [options.error] Callback to run on error of `fn`.
 */
const callbackOrPromise = ({ fn, args = [], success, error }) =>
  new Promise((resolve, reject) => {
    let handledSuccess = false;
    let handledError = false;

    const onSuccess = res => {
      if (handledSuccess) {
        return;
      }

      handledSuccess = true;
      if (success) {
        success(res);
        resolve();
      } else {
        resolve(res);
      }
    };

    const onError = err => {
      if (handledError) {
        return;
      }

      handledError = true;
      if (error) {
        error(err);
        resolve();
      } else {
        reject(err);
      }
    };

    const result = fn(...args, onSuccess, onError);

    if (isThenable(result)) {
      result.then(onSuccess).catch(onError);
    } else {
      resolve(result);
    }
  });

export default callbackOrPromise;
