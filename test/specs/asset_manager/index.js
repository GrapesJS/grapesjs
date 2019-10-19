import StorageManager from 'storage_manager';
import AssetManager from 'asset_manager';

describe('Asset Manager', () => {
  describe('Main', () => {
    var obj;
    var imgObj;

    var storage;
    var storageId = 'testStorage';
    var storageMock = {
      store(data) {
        storage = data;
      },
      load(keys) {
        return storage;
      }
    };

    beforeEach(() => {
      document.body.innerHTML = '<div id="asset-c"></div>';
      imgObj = {
        type: 'image',
        src: 'path/to/image',
        width: 101,
        height: 102
      };
      obj = new AssetManager();
      obj.init();
      document.body.querySelector('#asset-c').appendChild(obj.render());
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No assets inside', () => {
      expect(obj.getAll().length).toEqual(0);
    });

    test('Add new asset', () => {
      obj.add(imgObj);
      expect(obj.getAll().length).toEqual(1);
    });

    test('Added asset has correct data', () => {
      obj.add(imgObj);
      var asset = obj.get(imgObj.src);
      expect(asset.get('width')).toEqual(imgObj.width);
      expect(asset.get('height')).toEqual(imgObj.height);
      expect(asset.get('type')).toEqual(imgObj.type);
    });

    test('Add asset with src', () => {
      obj.add(imgObj.src);
      var asset = obj.get(imgObj.src);
      expect(asset.get('type')).toEqual('image');
      expect(asset.get('src')).toEqual(imgObj.src);
    });

    test('Add asset with more src', () => {
      obj.add([imgObj.src, imgObj.src + '2']);
      expect(obj.getAll().length).toEqual(2);
      var asset1 = obj.getAll().at(0);
      var asset2 = obj.getAll().at(1);
      expect(asset1.get('src')).toEqual(imgObj.src);
      expect(asset2.get('src')).toEqual(imgObj.src + '2');
    });

    test('Remove asset', () => {
      obj.add(imgObj);
      obj.remove(imgObj.src);
      expect(obj.getAll().length).toEqual(0);
    });

    test('Render assets', () => {
      obj.add(imgObj);
      expect(obj.render()).toBeTruthy();
    });

    describe('With storage', () => {
      var storageManager;

      beforeEach(() => {
        document.body.innerHTML = '<div id="asset-c"></div>';
        storageManager = new StorageManager().init({
          autoload: 0,
          type: storageId
        });
        obj = new AssetManager().init({
          stm: storageManager
        });
        storageManager.add(storageId, storageMock);
        document.body.querySelector('#asset-c').appendChild(obj.render());
      });

      afterEach(() => {
        storageManager = null;
      });

      test('Store and load data', () => {
        obj.add(imgObj);
        obj.store();
        obj.remove(imgObj.src);
        obj.load({ assets: storage['gjs-assets'] });
        var asset = obj.get(imgObj.src);
        expect(asset.get('width')).toEqual(imgObj.width);
        expect(asset.get('height')).toEqual(imgObj.height);
        expect(asset.get('type')).toEqual('image');
      });
    });
  });
});
