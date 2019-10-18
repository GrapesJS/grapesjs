const isThenable = obj =>
  typeof obj === 'object' && typeof obj.then === 'function';

/**
 * Handles calling success and error callbacks once for when a function can return a promise or use callbacks.
 */
const callbackOrPromise = ({
  fn,
  args = [],
  success = () => {},
  error = () => {}
}) => {
  let handledSuccess = false;
  let handledError = false;

  const onSuccess = res => {
    if (!handledSuccess) {
      success(res);
      handledSuccess = true;
      // return res;
    }
  };

  const onError = err => {
    if (!handledError) {
      error(err);
      handledError = true;
    }
  };

  const result = fn(...args, onSuccess, onError);

  if (isThenable(result)) {
    return result.then(onSuccess).catch(onError);
  }
};

export default callbackOrPromise;
