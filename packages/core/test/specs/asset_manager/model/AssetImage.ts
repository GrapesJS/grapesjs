import AssetImage from '../../../../src/asset_manager/model/AssetImage';

describe('AssetImage', () => {
  test('Object exists', () => {
    expect(AssetImage).toBeTruthy();
  });

  test('Has default values', () => {
    const obj = new AssetImage({});
    expect(obj.get('type')).toEqual('image');
    expect(obj.get('src')).toBeFalsy();
    expect(obj.get('unitDim')).toEqual('px');
    expect(obj.get('height')).toEqual(0);
    expect(obj.get('width')).toEqual(0);
    expect(obj.getExtension()).toBeFalsy();
    expect(obj.getFilename()).toBeFalsy();
  });
});
