import LocalStorage from 'storage_manager/model/LocalStorage';
import RemoteStorage from 'storage_manager/model/RemoteStorage';

describe('LocalStorage', () => {
  let obj;
  let data = {
    item1: 'value1',
    item2: 'value2',
  };

  beforeEach(() => {
    obj = new LocalStorage();
  });

  afterEach(() => {
    obj = null;
  });

  test('Store and load items', async () => {
    await obj.store(data);
    const result = await obj.load();
    expect(result).toEqual(data);
  });
});

describe('RemoteStorage', () => {
  let obj;
  let data;
  let defaultOpts = {
    urlStore: '/store',
    urlLoad: '/load',
    credentials: true,
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  };
  let mockResponse = (body = {}) => {
    return new window.Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-type': 'application/json' },
    });
  };

  beforeEach(() => {
    data = {
      item1: 'value1',
      item2: 'value2',
    };
    obj = new RemoteStorage();
    obj.request = jest.fn(() => Promise.resolve(mockResponse({ data: 1 })));
  });

  afterEach(() => {
    obj.request.mockRestore();
    obj = null;
  });

  test('Store data', async () => {
    await obj.store(data, defaultOpts);
    const { calls } = obj.request.mock;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(defaultOpts.urlStore);
    // expect(obj.request).toBeCalledWith(opts.urlStore, defaultOpts, opts);
    const { body, ...args } = calls[0][1];
    expect(args).toEqual({
      method: 'POST',
      headers: defaultOpts.headers,
      credentials: defaultOpts.credentials,
    });
  });

  test('Load data', async () => {
    await obj.load(defaultOpts);
    const { calls } = obj.request.mock;
    expect(obj.request).toBeCalledTimes(1);
    expect(calls[0][0]).toBe(defaultOpts.urlLoad);
    expect(calls[0][1]).toEqual({
      method: 'GET',
      body: undefined,
      headers: defaultOpts.headers,
      credentials: defaultOpts.credentials,
    });
  });

  test('Load data with custom fetch options', async () => {
    const customOpts = { customOpt: 'customValue' };
    await obj.load({
      ...defaultOpts,
      fetchOptions: () => customOpts,
    });

    expect(obj.request).toBeCalledTimes(1);
    expect(obj.request.mock.calls[0][1]).toEqual({
      method: 'GET',
      body: undefined,
      headers: defaultOpts.headers,
      credentials: defaultOpts.credentials,
      ...customOpts,
    });
  });
});
