import Assets from '../../../../src/asset_manager/model/Assets';
import AssetView from '../../../../src/asset_manager/view/AssetView';

describe('AssetView', () => {
  let testContext: { view?: AssetView };

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    const coll = new Assets();
    const model = coll.add({ src: 'test' });
    testContext.view = new AssetView({
      config: {},
      model,
    } as any);
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures')!.appendChild(testContext.view.render().el);
  });

  afterEach(() => {
    testContext.view!.remove();
  });

  test('Object exists', () => {
    expect(AssetView).toBeTruthy();
  });

  test('Has correct prefix', () => {
    expect(testContext.view!.pfx).toEqual('');
  });
});
