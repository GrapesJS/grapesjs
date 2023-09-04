import AssetImageView from '../../../../src/asset_manager/view/AssetImageView';
import Assets from '../../../../src/asset_manager/model/Assets';

describe('AssetImageView', () => {
  let obj: AssetImageView;

  beforeEach(() => {
    const coll = new Assets();
    const model = coll.add({ type: 'image', src: '/test' });
    obj = new AssetImageView({
      collection: new Assets(),
      config: {},
      model,
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures')!.appendChild(obj.render().el);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Object exists', () => {
    expect(AssetImageView).toBeTruthy();
  });

  describe('Asset should be rendered correctly', () => {
    test('Has preview box', () => {
      const $asset = obj.$el;
      expect($asset.find('.preview').length).toEqual(1);
    });

    test('Has meta box', () => {
      const $asset = obj.$el;
      expect($asset.find('.meta').length).toEqual(1);
    });

    test('Has close button', () => {
      const $asset = obj.$el;
      expect($asset.find('[data-toggle=asset-remove]').length).toEqual(1);
    });
  });

  test('Could be selected', () => {
    const spy = jest.spyOn(obj, 'updateTarget');
    obj.$el.trigger('click');
    expect(obj.$el.attr('class')).toContain('highlight');
    expect(spy).toHaveBeenCalled();
  });

  test('Could be chosen', () => {
    const spy = jest.spyOn(obj, 'updateTarget');
    obj.$el.trigger('dblclick');
    expect(spy).toHaveBeenCalled();
  });

  test('Could be removed', () => {
    const fn = jest.fn();
    obj.model.on('remove', fn);
    obj.onRemove({ stopImmediatePropagation() {} } as any);
    expect(fn).toBeCalledTimes(1);
  });
});
