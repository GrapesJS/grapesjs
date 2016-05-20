var path = 'StorageManager/model/';
define([path + 'LocalStorage',
        path + 'RemoteStorage'],
  function(LocalStorage, RemoteStorage) {

    return {
      run : function(){

        describe('LocalStorage', function() {

          var obj;
          var itemName = 'testItem';

          beforeEach(function () {
            obj = new LocalStorage();
          });

          afterEach(function () {
            delete obj;
          });

          it('Store and load item', function() {
            obj.store(itemName, 'test');
            obj.load(itemName).should.equal('test');
          });

          it('Remove item', function() {
            obj.store(itemName, 'test');
            obj.remove(itemName);
            (obj.load(itemName) === null).should.equal(true);
          });

        });

        describe('RemoteStorage', function() {

          var obj;
          var itemName = 'testItem';
          var endpointStore = 'testStoreEndpoint';
          var endpointLoad = 'testLoadEndpoint';
          var params = { test: 'testValue' };
          var storageOptions;

          beforeEach(function () {
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
            obj.store(itemName, 'test');
            var data = params;
            data.itemName = 'test';
            $.ajax.calledWithMatch({
              url: endpointStore,
            }).should.equal(true);
          });

          it('Load data', function() {
            sinon.stub($, "ajax").returns({
              done: function(){}
            });
            obj.load(itemName);
            var data = params;
            $.ajax.calledWithMatch({
              url: endpointLoad,
            }).should.equal(true);
          });

        });

      }

    };

});