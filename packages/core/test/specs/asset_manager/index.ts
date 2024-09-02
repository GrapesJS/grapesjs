import AssetManager from '../../../src/asset_manager';
import EditorModel from '../../../src/editor/model/Editor';

describe('Asset Manager', () => {
  describe('Main', () => {
    let obj: AssetManager;
    const imgObj = {
      type: 'image',
      src: 'path/to/image',
      width: 101,
      height: 102,
    };

    beforeEach(() => {
      document.body.innerHTML = '<div id="asset-c"></div>';
      obj = new AssetManager(new EditorModel());
      document.body.querySelector('#asset-c')!.appendChild(obj.render());
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
      const asset = obj.get(imgObj.src)!;
      expect(asset.get('width')).toEqual(imgObj.width);
      expect(asset.get('height')).toEqual(imgObj.height);
      expect(asset.get('type')).toEqual(imgObj.type);
    });

    test('Add asset with src', () => {
      obj.add(imgObj.src);
      const asset = obj.get(imgObj.src)!;
      expect(asset.get('type')).toEqual('image');
      expect(asset.get('src')).toEqual(imgObj.src);
    });

    test('Add asset with more src', () => {
      obj.add([imgObj.src, imgObj.src + '2']);
      expect(obj.getAll().length).toEqual(2);
      const asset1 = obj.getAll().at(0);
      const asset2 = obj.getAll().at(1);
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
  });
});
