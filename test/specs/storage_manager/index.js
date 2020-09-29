import StorageManager from 'storage_manager';
import Models from './model/Models';

describe('Storage Manager', () => {
  describe('Main', () => {
    var obj;

    beforeEach(() => {
      obj = new StorageManager().init();
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(StorageManager).toBeTruthy();
    });

    test('Autosave is active by default', () => {
      expect(obj.isAutosave()).toEqual(true);
    });

    test('Change autosave', () => {
      obj.setAutosave(0);
      expect(obj.isAutosave()).toEqual(false);
    });

    test('Steps before save are set as default', () => {
      expect(obj.getStepsBeforeSave()).toEqual(1);
    });

    test('Change steps before save', () => {
      obj.setStepsBeforeSave(5);
      expect(obj.getStepsBeforeSave()).toEqual(5);
    });

    test('Add and get new storage', () => {
      obj.add('test', 'gen');
      expect(obj.get('test')).toEqual('gen');
    });

    test('LocalStorage is set as default', () => {
      expect(obj.getCurrent()).toEqual('local');
    });

    test('Change storage type', () => {
      obj.setCurrent('remote');
      expect(obj.getCurrent()).toEqual('remote');
    });

    test('Store do not execute if empty', () => {
      expect(obj.store({ item: 'test' })).toBeUndefined();
    });

    test('Load default storages ', () => {
      obj.loadDefaultProviders();
      expect(obj.get('local')).toBeTruthy();
      expect(obj.get('remote')).toBeTruthy();
      expect(obj.get('test')).toBeFalsy();
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
        }
      };

      beforeEach(() => {
        storeValue = [];
        obj = new StorageManager().init({
          type: storageId
        });
        obj.add(storageId, storage);
      });

      afterEach(() => {
        obj = null;
      });

      test('Store and load data', () => {
        var data = {
          item: 'testData',
          item2: 'testData2'
        };
        var data2 = {};
        var id = obj.getConfig().id;
        data2[id + 'item'] = 'testData';
        data2[id + 'item2'] = 'testData2';

        obj.store(data);
        obj.load(['item', 'item2'], res => {
          expect(storeValue).toEqual(data2);
          expect(res).toEqual(data);
        });
      });
    });
  });
});
