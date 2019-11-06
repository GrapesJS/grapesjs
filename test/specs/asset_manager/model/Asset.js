import Asset from 'asset_manager/model/Asset';

describe('Asset', () => {
  test('Object exists', () => {
    expect(Asset).toBeTruthy();
  });

  test('Has default values', () => {
    var obj = new Asset({});
    expect(obj.get('type')).toBeFalsy();
    expect(obj.get('src')).toBeFalsy();
    expect(obj.getExtension()).toBeFalsy();
    expect(obj.getFilename()).toBeFalsy();
  });

  test('Test getFilename', () => {
    var obj = new Asset({ type: 'image', src: 'ch/eck/t.e.s.t' });
    expect(obj.getFilename()).toEqual('t.e.s.t');
    var obj = new Asset({ type: 'image', src: 'ch/eck/1234abc' });
    expect(obj.getFilename()).toEqual('1234abc');
  });

  test('Test getExtension', () => {
    var obj = new Asset({ type: 'image', src: 'ch/eck/t.e.s.t' });
    expect(obj.getExtension()).toEqual('t');
    var obj = new Asset({ type: 'image', src: 'ch/eck/1234abc.' });
    expect(obj.getExtension()).toEqual('');
  });
});
