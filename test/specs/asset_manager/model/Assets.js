import Assets from 'asset_manager/model/Assets';

describe('Assets', () => {
  var obj;

  beforeEach(() => {
    obj = new Assets();
  });

  afterEach(() => {
    obj = null;
  });

  test('Object exists', () => {
    expect(obj).toBeTruthy();
  });

  test('Collection is empty', () => {
    expect(obj.length).toEqual(0);
  });
});
