import EditorModel from '../../../src/editor/model/Editor';
import StorageManager from '../../../src/storage_manager';

describe('Storage Manager', () => {
  describe('Main', () => {
    let obj: StorageManager;
    let em: EditorModel;

    beforeEach(() => {
      em = new EditorModel();
      obj = em.Storage;
    });

    afterEach(() => {
      em.destroy();
    });

    test('Object exists', () => {
      expect(StorageManager).toBeTruthy();
    });

    test('Autosave is active by default', () => {
      expect(obj.isAutosave()).toEqual(true);
    });

    test('Change autosave', () => {
      obj.setAutosave(false);
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
      expect(obj.get('test')).toBe(undefined);
      obj.add('test', {
        async load() {
          return {};
        },
        async store() {},
      });
      expect(obj.get('test')).toBeDefined();
    });

    test('LocalStorage is set as default', () => {
      expect(obj.getCurrent()).toEqual('local');
    });

    test('Change storage type', () => {
      obj.setCurrent('remote');
      expect(obj.getCurrent()).toEqual('remote');
    });

    test('Store is executed', async () => {
      const spy = jest.spyOn(obj, '__exec');
      await obj.store({ item: 'test' });
      expect(spy).toBeCalledTimes(1);
    });

    test('Load default storages ', () => {
      expect(obj.get('local')).toBeTruthy();
      expect(obj.get('remote')).toBeTruthy();
      expect(obj.get('test')).toBeFalsy();
    });

    describe('With custom storage', () => {
      let storeValue = {};
      const storageId = 'testStorage';

      beforeEach(() => {
        storeValue = [];
        em = new EditorModel({
          storageManager: {
            type: storageId,
          },
        });
        obj = em.Storage;
        obj.add(storageId, {
          async store(data) {
            storeValue = data;
          },
          async load() {
            return storeValue;
          },
        });
      });

      afterEach(() => {
        em.destroy();
      });

      test('Check custom storage is enabled', () => {
        expect(obj.getCurrent()).toEqual(storageId);
        expect(obj.getCurrentStorage()).toBeDefined();
      });

      test('Store and load data', async () => {
        const data = {
          item: 'testData',
          item2: 'testData2',
        };

        await obj.store(data);
        expect(storeValue).toEqual(data);
        const res = await obj.load();
        expect(res).toEqual(data);
      });
    });
  });
});
