import Assets from '../../../../src/asset_manager/model/Assets';

describe('Assets', () => {
  let obj: Assets;

  beforeEach(() => {
    obj = new Assets();
  });

  test('Object exists', () => {
    expect(obj).toBeTruthy();
  });

  test('Collection is empty', () => {
    expect(obj.length).toEqual(0);
  });
});
