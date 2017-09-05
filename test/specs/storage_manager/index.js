const StorageManager = require('storage_manager');
const Models = require('./model/Models');

describe('Storage Manager', () => {

  describe('Main', () => {

    var obj;

    beforeEach(() => {
      obj = new StorageManager().init();
    });

    afterEach(() => {
      obj = null;
    });

    it('Object exists', () => {
      expect(StorageManager).toExist();
    });

    it('Autosave is active by default', () => {
      expect(obj.isAutosave()).toEqual(true);
    });

    it('Change autosave', () => {
      obj.setAutosave(0);
      expect(obj.isAutosave()).toEqual(false);
    });

    it('Steps before save are set as default', () => {
      expect(obj.getStepsBeforeSave()).toEqual(1);
    });

    it('Change steps before save', () => {
      obj.setStepsBeforeSave(5);
      expect(obj.getStepsBeforeSave()).toEqual(5);
    });

    it('Add and get new storage', () => {
      obj.add('test', 'gen');
      expect(obj.get('test')).toEqual('gen');
    });

    it('LocalStorage is set as default', () => {
      expect(obj.getCurrent()).toEqual('local');
    });

    it('Change storage type', () => {
      obj.setCurrent('remote');
      expect(obj.getCurrent()).toEqual('remote');
    });

    it('Store do not execute if empty', () => {
      expect(obj.store({item:'test'})).toEqual(null);
    });

    it('Load default storages ', () => {
      obj.loadDefaultProviders();
      expect(obj.get('local')).toExist();
      expect(obj.get('remote')).toExist();
      expect(obj.get('test')).toNotExist();
    });

    describe('With custom storage', () => {

      var storeValue;
      var storageId = 'testStorage';
      var storage = {
        store(data) {
          storeValue = data;
        },
        load(keys) {
          return storeValue;
        },
      };

      beforeEach(() => {
        storeValue = [];
        obj = new StorageManager().init({
          type: storageId,
        });
        obj.add(storageId, storage);
      });

      afterEach(() => {
        obj = null;
      });

      it('Store and load data', () => {
        var data = {
          item: 'testData',
          item2: 'testData2',
        };
        var data2 = {};
        var id = obj.getConfig().id;
        data2[id + 'item'] = 'testData';
        data2[id + 'item2'] = 'testData2';

        obj.store(data);
        obj.load(['item', 'item2'], (res) => {
          expect(storeValue).toEqual(data2);
          expect(res).toEqual(data);
        });
      });

    });

  });

  Models.run();

});
