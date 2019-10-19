import AssetsView from 'asset_manager/view/AssetsView';
import FileUploader from 'asset_manager/view/FileUploader';
import Assets from 'asset_manager/model/Assets';

describe('AssetsView', () => {
  var obj;
  var coll;

  beforeEach(() => {
    coll = new Assets([]);
    obj = new AssetsView({
      config: {},
      collection: coll,
      globalCollection: new Assets([]),
      fu: new FileUploader({})
    });
    obj = obj;
    document.body.innerHTML = '<div id="fixtures"></div>';
    obj.render();
    document.body.querySelector('#fixtures').appendChild(obj.el);
  });

  afterEach(() => {
    obj.collection.reset();
  });

  test('Object exists', () => {
    expect(AssetsView).toBeTruthy();
  });

  test('Collection is empty', () => {
    expect(obj.getAssetsEl().innerHTML).toBeFalsy();
  });

  test('Add new asset', () => {
    sinon.stub(obj, 'addAsset');
    coll.add({ src: 'test' });
    expect(obj.addAsset.calledOnce).toEqual(true);
  });

  test('Render new asset', () => {
    coll.add({ src: 'test' });
    expect(obj.getAssetsEl().innerHTML).toBeTruthy();
  });

  test('Render correctly new image asset', () => {
    coll.add({ type: 'image', src: 'test' });
    var asset = obj.getAssetsEl().firstChild;
    expect(asset.tagName).toEqual('DIV');
    expect(asset.innerHTML).toBeTruthy();
  });

  test('Clean collection from asset', () => {
    var model = coll.add({ src: 'test' });
    coll.remove(model);
    expect(obj.getAssetsEl().innerHTML).toBeFalsy();
  });

  test('Deselect works', () => {
    coll.add([{}, {}]);
    var $asset = obj.$el.children().first();
    $asset.attr('class', obj.pfx + 'highlight');
    coll.trigger('deselectAll');
    expect($asset.attr('class')).toBeFalsy();
  });

  test('Returns not empty assets element', () => {
    expect(obj.getAssetsEl()).toBeTruthy();
  });

  test('Returns not empty url input', () => {
    expect(obj.getAddInput()).toBeTruthy();
  });

  test('Add image asset from input string', () => {
    obj.getAddInput().value = 'test';
    obj.handleSubmit({
      preventDefault() {}
    });
    var asset = obj.options.globalCollection.at(0);
    expect(asset.get('src')).toEqual('test');
  });
});
