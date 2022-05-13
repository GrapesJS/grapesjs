import AssetImageView from 'asset_manager/view/AssetImageView';
import Assets from 'asset_manager/model/Assets';

let obj;

describe('AssetImageView', () => {
  beforeEach(() => {
    var coll = new Assets();
    var model = coll.add({ type: 'image', src: '/test' });
    obj = new AssetImageView({
      collection: new Assets(),
      config: {},
      model,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures').appendChild(obj.render().el);
  });

  afterEach(() => {
    obj = null;
    document.body.innerHTML = '';
  });

  test('Object exists', () => {
    expect(AssetImageView).toBeTruthy();
  });

  describe('Asset should be rendered correctly', () => {
    test('Has preview box', () => {
      var $asset = obj.$el;
      expect($asset.find('.preview').length).toEqual(1);
    });

    test('Has meta box', () => {
      var $asset = obj.$el;
      expect($asset.find('.meta').length).toEqual(1);
    });

    test('Has close button', () => {
      var $asset = obj.$el;
      expect($asset.find('[data-toggle=asset-remove]').length).toEqual(1);
    });
  });

  test('Could be selected', () => {
    var spy = jest.spyOn(obj, 'updateTarget');
    obj.$el.trigger('click');
    expect(obj.$el.attr('class')).toContain('highlight');
    expect(spy).toHaveBeenCalled();
  });

  test('Could be chosen', () => {
    sinon.stub(obj, 'updateTarget');
    var spy = jest.spyOn(obj, 'updateTarget');
    obj.$el.trigger('dblclick');
    expect(spy).toHaveBeenCalled();
    //obj.updateTarget.calledOnce.should.equal(true);
  });

  test('Could be removed', () => {
    var spy = sinon.spy();
    obj.model.on('remove', spy);
    obj.onRemove({ stopImmediatePropagation() {} });
    expect(spy.called).toEqual(true);
  });
});
