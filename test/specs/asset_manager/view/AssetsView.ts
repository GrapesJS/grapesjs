import AssetsView from '../../../../src/asset_manager/view/AssetsView';
import FileUploader from '../../../../src/asset_manager/view/FileUploader';
import Assets from '../../../../src/asset_manager/model/Assets';

describe('AssetsView', () => {
  let obj: AssetsView;
  let coll: Assets;

  beforeEach(() => {
    coll = new Assets();
    obj = new AssetsView({
      config: {},
      collection: coll,
      globalCollection: new Assets(),
      fu: new FileUploader({}),
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    obj.render();
    document.body.querySelector('#fixtures')!.appendChild(obj.el);
  });

  afterEach(() => {
    obj.collection.reset();
  });

  test('Object exists', () => {
    expect(AssetsView).toBeTruthy();
  });

  test('Collection is empty', () => {
    expect(obj.getAssetsEl()!.innerHTML).toBeFalsy();
  });

  test('Add new asset', () => {
    const spy = jest.spyOn(obj, 'addAsset');
    coll.add({ src: 'test' });
    expect(spy).toBeCalledTimes(1);
  });

  test('Render new asset', () => {
    coll.add({ src: 'test' });
    expect(obj.getAssetsEl()!.innerHTML).toBeTruthy();
  });

  test('Render correctly new image asset', () => {
    coll.add({ type: 'image', src: 'test' });
    const asset = obj.getAssetsEl()!.firstChild as HTMLElement;
    expect(asset.tagName).toEqual('DIV');
    expect(asset.innerHTML).toBeTruthy();
  });

  test('Clean collection from asset', () => {
    const model = coll.add({ src: 'test' });
    coll.remove(model);
    expect(obj.getAssetsEl()!.innerHTML).toBeFalsy();
  });

  test('Deselect works', () => {
    coll.add([{}, {}]);
    const $asset = obj.$el.children().first();
    $asset.attr('class', obj.pfx + 'highlight');
    coll.trigger('deselectAll');
    expect($asset.attr('class')).toBeFalsy();
  });

  test('Returns not empty assets element', () => {
    expect(obj.getAssetsEl()).toBeTruthy();
  });

  describe('Assets input is enabled', () => {
    let obj: AssetsView;
    let coll = new Assets();

    beforeEach(() => {
      const config = {
        showUrlInput: true,
      };

      obj = new AssetsView({
        config: config,
        collection: coll,
        globalCollection: new Assets(),
        fu: new FileUploader({}),
      });
      document.body.innerHTML = '<div id="fixtures"></div>';
      obj.render();
      document.body.querySelector('#fixtures')!.appendChild(obj.el);
    });

    test('Returns not empty url input', () => {
      expect(obj.getAddInput()).toBeTruthy();
    });

    test('Add image asset from input string', () => {
      obj.getAddInput()!.value = 'test';
      obj.handleSubmit({
        preventDefault() {},
      } as Event);
      const asset = obj.options.globalCollection.at(0);
      expect(asset.get('src')).toEqual('test');
    });
  });

  describe('Assets inputs is disabled', () => {
    let obj: AssetsView;
    let coll: Assets;

    beforeEach(() => {
      const config = {
        showUrlInput: false,
      };

      coll = new Assets();
      obj = new AssetsView({
        config: config,
        collection: coll,
        globalCollection: new Assets(),
        fu: new FileUploader({}),
      });
      document.body.innerHTML = '<div id="fixtures"></div>';
      obj.render();
      document.body.querySelector('#fixtures')!.appendChild(obj.el);
    });

    test('No presence of url input', () => {
      expect(obj.getAddInput()).toBeFalsy();
    });
  });
});
