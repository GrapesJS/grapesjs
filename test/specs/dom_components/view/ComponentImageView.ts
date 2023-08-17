import ComponentImageView from '../../../../src/dom_components/view/ComponentImageView';
import Component from '../../../../src/dom_components/model/ComponentImage';

describe('ComponentImageView', () => {
  let model: Component;
  let view: ComponentImageView;

  beforeEach(() => {
    model = new Component();
    const cmpViewOpts = {
      model,
      config: {},
    };
    view = new ComponentImageView(cmpViewOpts);
    document.body.innerHTML = '<div id="fixtures"></div>';
    document.body.querySelector('#fixtures')!.appendChild(view.render().el);
  });

  afterEach(() => {
    view.remove();
  });

  test('Component empty', () => {
    expect(view.el.getAttribute('class')).toEqual(view.classEmpty);
  });

  test('TagName is <img>', () => {
    expect(view.el.tagName).toEqual('IMG');
  });

  test('Update src attribute', () => {
    model.set('src', './');
    expect(view.el.getAttribute('src')).toEqual('./');
  });

  test('Renders correctly', () => {
    expect(view.render()).toBeTruthy();
  });
});
