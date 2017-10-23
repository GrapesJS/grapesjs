import 'whatwg-fetch';

const LocalStorage = require('storage_manager/model/LocalStorage');
const RemoteStorage = require('storage_manager/model/RemoteStorage');

module.exports = {
  run() {

    describe('LocalStorage', () => {

      var obj;
      var itemName = 'testItem';
      var data = {
        'item1': 'value1',
        'item2': 'value2',
      };

      beforeEach(() => {
        obj = new LocalStorage();
      });

      afterEach(() => {
        obj = null;
      });

      it('Store and load items', () => {
        obj.store(data);
        var result = obj.load(['item1', 'item2']);
        expect(result).toEqual(data);
      });

      it('Store, update and load items', () => {
        obj.store(data);
        obj.store({item3: 'value3'});
        obj.store({item2: 'value22'});
        var result = obj.load(['item1', 'item2', 'item3']);
        expect(result).toEqual({
          'item1': 'value1',
          'item2': 'value22',
          'item3': 'value3',
        });
      });

      it('Remove items', () => {
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
      }

      beforeEach(() => {
        data = {
          'item1': 'value1',
          'item2': 'value2',
        };
        storageOptions = {
            urlStore: endpointStore,
            urlLoad: endpointLoad,
            params,
        };
        obj = new RemoteStorage(storageOptions);
        sinon.stub(obj, 'fetch').returns(
          Promise.resolve(mockResponse({data: 1}))
        );
      });

      afterEach(() => {
        obj.fetch.restore();
        obj = null;
      });

      it('Store data', () => {
        obj.store(data);
        const callResult = obj.fetch;
        expect(callResult.called).toEqual(true);
        expect(callResult.firstCall.args[0]).toEqual(endpointStore);
      });

      it('Load data', () => {
        obj.load(['item1', 'item2']);
        const callResult = obj.fetch;
        expect(callResult.called).toEqual(true);
        expect(callResult.firstCall.args[0]).toEqual(endpointLoad);
      });

    });

  }

};
