import LayerView from 'style_manager/view/LayerView';
import Layers from 'style_manager/model/Layers';

describe('LayerView', () => {
  var component;
  var fixtures;
  var target;
  var model;
  var view;

  beforeEach(() => {
    var coll = new Layers();
    model = coll.add({});
    view = new LayerView({
      model
    });
    document.body.innerHTML = '<div id="fixtures"></div>';
    fixtures = document.body.firstChild;
    fixtures.appendChild(view.render().el);
  });

  afterAll(() => {
    component = null;
    view = null;
    model = null;
  });

  test('Rendered correctly', () => {
    var layer = view.el;
    expect(fixtures.querySelector('.layer')).toBeTruthy();
    expect(layer.querySelector('#label')).toBeTruthy();
    expect(layer.querySelector('#close-layer')).toBeTruthy();
    expect(view.getPropertiesWrapper()).toBeTruthy();
    expect(view.getPreviewEl()).toBeTruthy();
  });

  test('Is not active by default', () => {
    expect(view.$el.hasClass('active')).toEqual(false);
  });

  test('Is possible to activate it', () => {
    view.model.set('active', 1);
    expect(view.$el.hasClass('active')).toEqual(true);
  });

  test('Is possible to activate it with active()', () => {
    view.active();
    expect(view.$el.hasClass('active')).toEqual(true);
  });

  test('No preview', () => {
    var style = view.el.querySelector('#preview').style;
    expect(style.cssText).toBeFalsy();
  });
});
