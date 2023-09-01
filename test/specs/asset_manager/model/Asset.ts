import Asset from '../../../../src/asset_manager/model/Asset';

describe('Asset', () => {
  test('Object exists', () => {
    expect(Asset).toBeTruthy();
  });

  test('Has default values', () => {
    const asset = new Asset({});
    expect(asset.get('type')).toBeFalsy();
    expect(asset.get('src')).toBeFalsy();
    expect(asset.getExtension()).toBeFalsy();
    expect(asset.getFilename()).toBeFalsy();
  });

  test('Test getFilename', () => {
    const asset = new Asset({ type: 'image', src: 'ch/eck/t.e.s.t' });
    expect(asset.getFilename()).toEqual('t.e.s.t');
    const asset2 = new Asset({ type: 'image', src: 'ch/eck/1234abc' });
    expect(asset2.getFilename()).toEqual('1234abc');
  });

  test('Test getExtension', () => {
    const asset = new Asset({ type: 'image', src: 'ch/eck/t.e.s.t' });
    expect(asset.getExtension()).toEqual('t');
    const asset2 = new Asset({ type: 'image', src: 'ch/eck/1234abc.' });
    expect(asset2.getExtension()).toEqual('');
  });
});
