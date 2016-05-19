var modulePath = './../../../test/specs/storage_manager';

define([
        'StorageManager',
         ],
  function(
          StorageManager
          ) {

    describe('Storage Manager', function() {

      describe('Main', function() {

        var obj;

        beforeEach(function () {
          obj = new StorageManager();
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
          (obj.store('item','test') === null).should.equal(true);
        });

        it('Load do not execute if empty', function() {
          (obj.load('item') === null).should.equal(true);
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
            store: function(n, v){
              storeValue[n] = v;
            },
            load: function(n){
              return storeValue[n];
            },
          };

          beforeEach(function () {
            storeValue = [];
            obj = new StorageManager({
              storageType: storageId,
            });
            obj.add(storageId, storage);
          });

          afterEach(function () {
            delete obj;
          });

          it('Store and load data', function() {
            obj.store('item','testData');
            storeValue['item'].should.equal('testData');
            obj.load('item').should.equal('testData');
          });

          it('Load inexistent data', function() {
            obj.store('item','testData');
            (obj.load('item2') === undefined).should.equal(true);
          });

        });

      });

      //Models.run();

    });
});