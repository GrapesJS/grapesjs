var path = 'StorageManager/model/';
define([path + 'LocalStorage',
        path + 'RemoteStorage'],
  function(LocalStorage, RemoteStorage) {

    return {
      run : function(){

        describe('LocalStorage', function() {

          var obj;
          var itemName = 'testItem';
          var data = {
            'item1': 'value1',
            'item2': 'value2',
          };

          beforeEach(function () {
            obj = new LocalStorage();
          });

          afterEach(function () {
            delete obj;
          });

          it('Store and load items', function() {
            obj.store(data);
            var result = obj.load(['item1', 'item2']);
            result.should.deep.equal(data);
          });

          it('Store, update and load items', function() {
            obj.store(data);
            obj.store({item3: 'value3'});
            obj.store({item2: 'value22'});
            var result = obj.load(['item1', 'item2', 'item3']);
            result.should.deep.equal({
              'item1': 'value1',
              'item2': 'value22',
              'item3': 'value3',
            });
          });

          it('Remove items', function() {
            var items = ['item1', 'item2', 'item3'];
            obj.store(data);
            obj.remove(items);
            obj.load(items).should.be.empty;
          });

        });

        describe('RemoteStorage', function() {

          var obj;
          var itemName = 'testItem';
          var endpointStore = 'testStoreEndpoint';
          var endpointLoad = 'testLoadEndpoint';
          var params = { test: 'testValue' };
          var storageOptions;
          var data;

          beforeEach(function () {
            data = {
              'item1': 'value1',
              'item2': 'value2',
            };
            storageOptions = {
                urlStore: endpointStore,
                urlLoad: endpointLoad,
                params: params,
            };
            obj = new RemoteStorage(storageOptions);
          });

          afterEach(function () {
            $.ajax.restore();
            delete obj;
          });

          it('Store data', function() {
            sinon.stub($, "ajax");

            for(var k in params)
              data[k] = params[k];

            obj.store(data);
            $.ajax.calledWithMatch({
              url: endpointStore,
              data: data,
            }).should.equal(true);
          });

          it('Load data', function() {
            sinon.stub($, "ajax").returns({
              done: function(){}
            });
            var dt = {};
            var keys = ['item1', 'item2'];
            obj.load(keys);
            dt.keys = keys;

            for(var k in params)
              dt[k] = params[k];

            $.ajax.calledWithMatch({
              url: endpointLoad,
              data: dt
            }).should.equal(true);
          });

        });

      }

    };

});