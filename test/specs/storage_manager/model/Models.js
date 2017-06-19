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
      });

      afterEach(() => {
        $.ajax.restore();
        obj = null;
      });

      // Stubbing will not return the original object so
      // .always will not work
      it.skip('Store data', () => {
        sinon.stub($, "ajax");

        for(var k in params)
          data[k] = params[k];

        obj.store(data);
        $.ajax.calledWithMatch({
          url: endpointStore,
          data,
        }).should.equal(true);
      });

      it('Load data', () => {
        sinon.stub($, "ajax").returns({
          done() {}
        });
        var dt = {};
        var keys = ['item1', 'item2'];
        obj.load(keys);
        dt.keys = keys;

        for(var k in params)
          dt[k] = params[k];

        expect($.ajax.calledWithMatch({
          url: endpointLoad,
          data: dt
        })).toEqual(true);
      });

    });

  }

};
