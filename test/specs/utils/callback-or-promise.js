import callbackOrPromise from 'utils/callback-or-promise';

const waitThenResolveWith = value =>
  new Promise(resolve => setTimeout(() => resolve(value), 100));
const waitThenRejectWith = value =>
  new Promise((_, reject) => setTimeout(() => reject(value), 100));

describe('callback or promise util', () => {
  test('success is called once using callbacks', () => {
    const fn = jest.fn(clb => {
      clb('success');
    });

    const onSuccess = jest.fn(value => {
      expect(value).toBe('success');
    });
    const onError = jest.fn();

    const result = callbackOrPromise({
      fn,
      success: onSuccess,
      error: onError
    });

    expect(fn).toBeCalledTimes(1);
    expect(result).toBeInstanceOf(Promise);
    expect(onSuccess).toBeCalledTimes(1);
    expect(onError).toBeCalledTimes(0);
  });

  test('success called once using promises', async () => {
    const fn = jest.fn(() => waitThenResolveWith('success'));

    const result = callbackOrPromise({ fn });

    expect(fn).toBeCalledTimes(1);
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toEqual('success');
  });

  test('error called once using callbacks', () => {
    const fn = jest.fn((_, clbErr) => {
      clbErr('error');
    });

    const onSuccess = jest.fn();
    const onError = jest.fn(value => {
      expect(value).toBe('error');
    });

    const result = callbackOrPromise({
      fn,
      success: onSuccess,
      error: onError
    });

    expect(fn).toBeCalledTimes(1);
    expect(result).toBeInstanceOf(Promise);
    expect(onSuccess).toBeCalledTimes(0);
    expect(onError).toBeCalledTimes(1);
  });

  test('error called once using promises', async () => {
    const fn = () => waitThenRejectWith('error');

    expect(callbackOrPromise({ fn })).rejects.toThrow('error');
  });

  test('cannot await when using callbacks', async () => {
    const fn = jest.fn(clb => {
      clb('success');
    });

    const onSuccess = jest.fn(value => {
      expect(value).toBe('success');
      return value;
    });
    const onError = jest.fn();

    const result = await callbackOrPromise({
      fn,
      success: onSuccess,
      error: onError
    });

    expect(fn).toBeCalledTimes(1);
    expect(result).toBeUndefined();
    expect(onSuccess).toBeCalledTimes(1);
    expect(onError).toBeCalledTimes(0);
  });

  test('success called only once when mixing callbacks with promises', async () => {
    const fn = jest.fn(cb => {
      cb('success from callback');
      return waitThenResolveWith('success from promise');
    });

    const onSuccess = jest.fn(value => {
      expect(value).toBe('success from callback');
    });
    const onError = jest.fn();

    const result = callbackOrPromise({
      fn,
      success: onSuccess,
      error: onError
    });

    expect(fn).toBeCalledTimes(1);
    // We always resolve with undefined when using callbacks
    expect(await result).toBeUndefined();
    expect(onSuccess).toBeCalledTimes(1);
    expect(onError).toBeCalledTimes(0);
  });

  test('error called only once when mixing callbacks with promises', async () => {
    const fn = jest.fn((_, cbErr) => {
      cbErr('error from callback');
      return waitThenRejectWith('error from promise');
    });

    const onSuccess = jest.fn(v => v);
    const onError = jest.fn(v => v);

    const result = callbackOrPromise({
      fn,
      success: onSuccess,
      error: onError
    });

    // We don't return anything when using callbacks, even if fn returns a promise
    expect(await result).toBeUndefined();
    expect(fn).toBeCalledTimes(1);
    expect(onSuccess).toBeCalledTimes(0);
    expect(onError).toBeCalledTimes(1);
  });

  test('arguments are passed to fn', () => {
    const expectedArgument1 = 'foo';
    const expectedArgument2 = 'bar';

    expect.assertions(5 * 2);
    const fn = (...args) => {
      expect(args.length).toBe(4);
      expect(args[0]).toEqual(expectedArgument1);
      expect(args[1]).toEqual(expectedArgument2);
      expect(args[2]).toEqual(expect.any(Function));
      expect(args[3]).toEqual(expect.any(Function));
    };

    // Non promises
    callbackOrPromise({
      fn,
      args: [expectedArgument1, expectedArgument2]
    });

    // Promises
    callbackOrPromise({
      fn: async (...args) => fn(...args),
      args: [expectedArgument1, expectedArgument2]
    });
  });

  // test('successfully wraps and resolves synchronous oprerations', async () => {
  //   const expected = 'foo';
  //   const result = await callbackOrPromise({
  //     fn: () => expected
  //   });

  //   expect(result).toEqual(expected);
  // });
});
