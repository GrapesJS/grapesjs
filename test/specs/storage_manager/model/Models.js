import 'whatwg-fetch';
import LocalStorage from 'storage_manager/model/LocalStorage';
import RemoteStorage from 'storage_manager/model/RemoteStorage';

describe('LocalStorage', () => {
  var obj;
  var itemName = 'testItem';
  var data = {
    item1: 'value1',
    item2: 'value2'
  };

  beforeEach(() => {
    obj = new LocalStorage();
  });

  afterEach(() => {
    obj = null;
  });

  test('Store and load items', () => {
    obj.store(data);
    var result = obj.load(['item1', 'item2']);
    expect(result).toEqual(data);
  });

  test('Store, update and load items', () => {
    obj.store(data);
    obj.store({ item3: 'value3' });
    obj.store({ item2: 'value22' });
    var result = obj.load(['item1', 'item2', 'item3']);
    expect(result).toEqual({
      item1: 'value1',
      item2: 'value22',
      item3: 'value3'
    });
  });

  test('Remove items', () => {
    var items = ['item1', 'item2', 'item3'];
    obj.store(data);
    obj.remove(items);
    expect(obj.load(items)).toEqual({});
  });
});

describe('RemoteStorage', () => {
  var obj;
  var itemName = 'testItem';
  var endpointStore = 'testStoreEndpoint';
  var endpointLoad = 'testLoadEndpoint';
  var params = { test: 'testValue' };
  var storageOptions;
  var data;
  var mockResponse = (body = {}) => {
    return new window.Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-type': 'application/json' }
    });
  };

  beforeEach(() => {
    data = {
      item1: 'value1',
      item2: 'value2'
    };
    storageOptions = {
      urlStore: endpointStore,
      urlLoad: endpointLoad,
      params
    };
    obj = new RemoteStorage(storageOptions);
    sinon
      .stub(obj, 'fetch')
      .returns(Promise.resolve(mockResponse({ data: 1 })));
  });

  afterEach(() => {
    obj.fetch.restore();
    obj = null;
  });

  test('Store data', () => {
    obj.store(data);
    const callResult = obj.fetch;
    expect(callResult.called).toEqual(true);
    expect(callResult.firstCall.args[0]).toEqual(endpointStore);
  });

  test('Load data', () => {
    obj.load(['item1', 'item2']);
    const callResult = obj.fetch;
    expect(callResult.called).toEqual(true);
    expect(callResult.firstCall.args[0]).toEqual(endpointLoad);
  });

  test("Load data with credentials option as 'include' by default", () => {
    obj.load(['item1', 'item2']);
    const callResult = obj.fetch;
    expect(callResult.called).toEqual(true);
    expect(callResult.firstCall.args[1]).toMatchObject({
      credentials: 'include'
    });
  });

  test("Store data with credentials option as 'include' by default", () => {
    obj.store(data);
    const callResult = obj.fetch;
    expect(callResult.called).toEqual(true);
    expect(callResult.firstCall.args[1]).toMatchObject({
      credentials: 'include'
    });
  });

  test('Store data with credentials option as false ', () => {
    obj = new RemoteStorage({ ...storageOptions, credentials: false });
    sinon
      .stub(obj, 'fetch')
      .returns(Promise.resolve(mockResponse({ data: 1 })));

    obj.store(data);
    const callResult = obj.fetch;
    expect(callResult.called).toEqual(true);
    expect(callResult.firstCall.args[1]).toMatchObject({
      credentials: false
    });
  });

  test('Load data with credentials option as false', () => {
    obj = new RemoteStorage({ ...storageOptions, credentials: false });
    sinon
      .stub(obj, 'fetch')
      .returns(Promise.resolve(mockResponse({ data: 1 })));
    obj.load(['item1', 'item2']);
    const callResult = obj.fetch;
    expect(callResult.called).toEqual(true);
    expect(callResult.firstCall.args[1]).toMatchObject({
      credentials: false
    });
  });

  test('Load data with custom fetch options as function', () => {
    const customOpts = { customOpt: 'customValue' };
    obj = new RemoteStorage({
      ...storageOptions,
      fetchOptions: () => {
        return customOpts;
      }
    });
    sinon
      .stub(obj, 'fetch')
      .returns(Promise.resolve(mockResponse({ data: 1 })));
    obj.load(['item1', 'item2']);
    const callResult = obj.fetch;
    expect(callResult.called).toEqual(true);
    expect(callResult.firstCall.args[1]).toMatchObject(customOpts);
  });
});
