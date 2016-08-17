var modulePath = './../../../test/specs/storage_manager';

define([
        'StorageManager',
        modulePath + '/model/Models',
         ],
  function(
          StorageManager,
          Models
          ) {

    describe('Storage Manager', function() {

      describe('Main', function() {

        var obj;

        beforeEach(function () {
          obj = new StorageManager().init();
        });

        afterEach(function () {
          delete obj;
        });

        it('Object exists', function() {
          StorageManager.should.be.exist;
        });

        it('Autosave is active by default', function() {
          obj.isAutosave().should.equal(true);
        });

        it('Change autosave', function() {
          obj.setAutosave(0);
          obj.isAutosave().should.equal(false);
        });

        it('Steps before save are set as default', function() {
          obj.getStepsBeforeSave().should.equal(1);
        });

        it('Change steps before save', function() {
          obj.setStepsBeforeSave(5);
          obj.getStepsBeforeSave().should.equal(5);
        });

        it('No storages inside', function() {
          obj.getStorages().should.be.empty;
        });

        it('Add and get new storage', function() {
          obj.add('test', 'gen');
          obj.get('test').should.equal('gen');
        });

        it('LocalStorage is set as default', function() {
          obj.getCurrent().should.equal('local');
        });

        it('Change storage type', function() {
          obj.setCurrent('remote');
          obj.getCurrent().should.equal('remote');
        });

        it('Store do not execute if empty', function() {
          (obj.store({item:'test'}) === null).should.equal(true);
        });

        it('Load do not execute if empty', function() {
          obj.load(['item']).should.be.empty;
        });

        it('Load default storages ', function() {
          obj.loadDefaultProviders();
          obj.get('local').should.not.be.empty;
          obj.get('remote').should.not.be.empty;
          (obj.get('test') === null).should.equal(true);
        });

        describe('With custom storage', function() {

          var storeValue;
          var storageId = 'testStorage';
          var storage = {
            store: function(data){
              storeValue = data;
            },
            load: function(keys){
              return storeValue;
            },
          };

          beforeEach(function () {
            storeValue = [];
            obj = new StorageManager().init({
              type: storageId,
            });
            obj.add(storageId, storage);
          });

          afterEach(function () {
            delete obj;
          });

          it('Store and load data', function() {
            var data = {
              item: 'testData',
              item2: 'testData2',
            };
            var data2 = {};
            var id = obj.getConfig().id;
            data2[id + 'item'] = 'testData';
            data2[id + 'item2'] = 'testData2';

            obj.store(data);
            var load = obj.load(['item', 'item2']);
            storeValue.should.deep.equal(data2);
            load.should.deep.equal(data);
          });

        });

      });

      Models.run();

    });
});