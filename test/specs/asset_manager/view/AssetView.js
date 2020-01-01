import Assets from 'asset_manager/model/Assets';
import AssetView from 'asset_manager/view/AssetView';

describe('AssetView', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    var coll = new Assets();
    var model = coll.add({ src: 'test' });
    testContext.view = new AssetView({
      config: {},
      model
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body
      .querySelector('#fixtures')
      .appendChild(testContext.view.render().el);
  });

  afterEach(() => {
    testContext.view.remove();
  });

  test('Object exists', () => {
    expect(AssetView).toBeTruthy();
  });

  test('Has correct prefix', () => {
    expect(testContext.view.pfx).toEqual('');
  });
});
